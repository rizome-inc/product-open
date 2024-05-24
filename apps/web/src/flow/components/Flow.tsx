import { useFlowProjectEditingContext } from "@/context/flowProject";
import { useRoom, useStatus, useUpdateMyPresence } from "@/liveblocks.config";
import { Box } from "@mui/system";
import { SmartStraightEdge } from "@tisoap/react-flow-smart-edge";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  DefaultEdgeOptions,
  Edge,
  FitViewOptions,
  MarkerType,
  NodeTypes,
  ReactFlowInstance,
  useKeyPress,
  useReactFlow,
} from "reactflow";
import useAutoLayout from "../layout/useAutoLayout";
import { isValidConnection } from "../layout/validation";
import { rizomeNodeTypes } from "../nodes/rizomeNodeTypes";
import useLocalGraphBridgeStore from "../store/localGraphBridgeStore";
import Cursors from "./Cursors";
import InteractionLayer from "./InteractionLayer";

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const edgeTypes = {
  smart: SmartStraightEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  // animated: true,
  type: "smart",
  style: {
    strokeWidth: 2,
    cursor: "default",
  },
  markerEnd: {
    type: MarkerType.Arrow,
    width: 20,
    height: 20,
  },
};

/**
 * WIP notes
 *
 * Figure out how to start the viewport at an appropriate zoom level
 *
 * Should we have some kind of edge between operators and operands? Otherwise, how would we know the order within and between expressions?
 * Also PEMDAS
 */
export default function Flow({ roomId }: { roomId: string }) {
  // Simple protected page
  const backspacePressed = useKeyPress("Backspace");
  const { setEdges } = useReactFlow();

  // console.log(self.id)

  const room = useRoom();
  const status = useStatus();

  useEffect(() => {
    if (status === "disconnected") {
      room.reconnect();
    }
  }, [room, status]);

  //to get others' colors
  //const others = useOthers();
  //others[0].info.color or others[0].info.

  const { isEditing, liveblocksStore } = useFlowProjectEditingContext();

  const nodeTypes: NodeTypes = useMemo(() => rizomeNodeTypes, []);

  const {
    liveblocks: { enterRoom, leaveRoom, isStorageLoading },
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = liveblocksStore();

  // console.log(nodes)

  // Enter the Liveblocks room on load
  useEffect(() => {
    enterRoom(roomId);
    return () => leaveRoom();
  }, [enterRoom, leaveRoom, roomId]);

  // Local node state for UI interactions that shouldn't be persisted across users
  const { setNodeIds } = useLocalGraphBridgeStore();

  // Update nodeIds when liveblocks nodes change
  useEffect(() => {
    setNodeIds(nodes.map((node) => node.id));
  }, [nodes, setNodeIds]);

  useAutoLayout();

  //update the flowchart's zoom after nodes are drawn
  const [reactflowInstance, setReactflowInstance] = useState<ReactFlowInstance>();
  const onInit = (flow: ReactFlowInstance) => {
    setReactflowInstance(flow);
  };
  useEffect(() => {
    if (reactflowInstance && nodes.length) {
      reactflowInstance.fitView();
    }
  }, [reactflowInstance, nodes.length]);

  const updateMyPresence = useUpdateMyPresence();
  const { screenToFlowPosition } = useReactFlow();

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      updateMyPresence({ cursor: position });
    },
    [screenToFlowPosition, updateMyPresence],
  );

  // todo: clean up the nesting of elements & perhaps pass the dimensions prop down from the parent when it mounts
  // const ref = useRef<HTMLDivElement>();
  const [dimensions, setDimensions] = useState({
    width: "90vw",
    height: "calc(100vh - 220px)",
  });

  // useEffect(() => {
  //   if (ref.current) {
  //     setDimensions({
  //       width: ref.current.parentElement?.offsetWidth ?? 100,
  //       // height: ref.current.offsetHeight,
  //     });
  //   }
  // }, []);

  const [selectedEdge, setSelectedEdge] = useState<Edge>();
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, edge: Edge) => {
      setSelectedEdge(edge);
    },
    [setSelectedEdge],
  );

  const handleEdgeMouseLeave = useCallback(() => {
    setSelectedEdge(undefined);
  }, [setSelectedEdge]);

  useEffect(() => {
    if (isEditing && backspacePressed && selectedEdge) {
      setEdges((es) => es.filter((e) => e.id !== selectedEdge.id));
    }
  }, [backspacePressed, isEditing, selectedEdge, setEdges]);

  // todo: is this necessary since we're using suspense?
  if (isStorageLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box
      sx={() => ({
        "& .react-flow__pane": { cursor: "move" },
      })}
    >
      <div style={{ width: dimensions.width, height: dimensions.height }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange(isEditing)}
          onEdgesChange={onEdgesChange(isEditing)}
          onConnect={onConnect(isEditing)}
          onEdgeClick={handleEdgeClick}
          onEdgeMouseLeave={handleEdgeMouseLeave}
          isValidConnection={isValidConnection(nodes)}
          fitView={true}
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
          nodeTypes={nodeTypes}
          zoomOnDoubleClick={false}
          onPointerMove={onMouseMove}
          onPointerLeave={() => updateMyPresence({ cursor: null })}
          proOptions={{ hideAttribution: true }}
          // deleteKeyCode={isEditing ? "Backspace" : null}
          deleteKeyCode={null}
          selectionKeyCode={null}
          multiSelectionKeyCode={null}
          onInit={onInit}
        >
          <Cursors />
          <InteractionLayer />
        </ReactFlow>
      </div>
    </Box>
  );
}
