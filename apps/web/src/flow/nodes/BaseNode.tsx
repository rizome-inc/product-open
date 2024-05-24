import { useFlowProjectEditingContext } from "@/context/flowProject";
import {
  useInboxNotifications,
  useSelf,
  useThreads,
  useUpdateMyPresence,
} from "@/liveblocks.config";
import { MoreVert } from "@mui/icons-material";
import { Badge, PaletteColor, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { MouseEvent, PropsWithChildren, ReactNode, useCallback, useEffect, useState } from "react";
import { Edge, Node, NodeProps, useReactFlow } from "reactflow";
import { StyledHandle } from "../components/StyledHandle";
import Toolbar from "../components/Toolbar";
import { useNodeSelections } from "../hooks/useSelectedByOther";
import { Base, ExpressionNode, OperandNode, OperatorNode } from "../store/dataTypes";
import useLocalGraphBridgeStore from "../store/localGraphBridgeStore";
import NodeFactory from "../store/nodeFactory";

export type BaseNodeProps = PropsWithChildren<{
  handles: ReactNode[];
  color: PaletteColor;
  title: string;
  width?: number;
}> &
  Base;

/**
 * Only render toolbar if this node is the bottommost in the column
 * We do that by checking for the highest y position
 */
export const isLastNodeInColumn = (nodes: Node<Base>[], column: number, yPos: number): boolean =>
  Math.max(
    ...nodes.filter((n) => n.data.column === column && !n.parentNode).map((n) => n.position.y),
  ) === yPos;

// todo: may want to inset the border to prevent pixelation
export default function BaseNodeElement(props: NodeProps<BaseNodeProps>) {
  const { id, data, type: nodeType, yPos } = props;
  const { handles, color, title, children, width } = data;

  const updateMyPresence = useUpdateMyPresence();
  const { isEditing, liveblocksStore } = useFlowProjectEditingContext();

  const { setNodes, setEdges } = useReactFlow();

  const {
    setDrawerIsOpen,
    setDrawerData,
    setMenuAnchorElement,
    setMenuIsOpen,
    setHandleMenuDeleteClick,
    setHandleMenuDetailClick,
    setNodeName,
  } = useLocalGraphBridgeStore();

  const { nodes, edges } = liveblocksStore();

  const { inboxNotifications } = useInboxNotifications();

  // Only load threads for this node
  const { threads } = useThreads({
    query: {
      metadata: {
        nodeId: id,
      },
    },
  });

  const [unreadNodeNotifications, setUnreadNodeNotifications] = useState<number>(0);
  useEffect(() => {
    if (inboxNotifications !== undefined && threads !== undefined) {
      const unreadNotificationThreadIds = inboxNotifications
        .filter((n) => n.readAt === null)
        .map((n) => n.threadId);
      setUnreadNodeNotifications(
        threads.filter((t) => unreadNotificationThreadIds.includes(t.id)).length,
      );
    } else {
      setUnreadNodeNotifications(0);
    }
  }, [inboxNotifications, threads]);

  const self = useSelf();
  const { selectionStatus } = useNodeSelections();
  const { selected, editorName } = selectionStatus(id, self.id);

  const nodeFactory = new NodeFactory(true);

  const onDetailClick = () => {
    setDrawerData(id, data);
    setDrawerIsOpen(true);
  };

  const onAddNode = () => {
    let newNodes: Node[] = [];
    let newEdges: Edge[] = [];
    switch (nodeType) {
      case "dataNode": {
        const dataNode = nodeFactory.createDataNode({
          drawer: {},
          value: {},
          column: data.column,
        });
        newNodes = [dataNode];
        break;
      }
      case "model": {
        const created = nodeFactory.createModelNode({
          drawer: {},
          value: {},
          column: data.column,
        });
        newNodes = created.nodes;
        newEdges = created.edges;
        break;
      }
      case "operand": {
        const operandNode = nodeFactory.createOperandNode({
          drawer: {},
          value: {},
          column: data.column,
        });
        newNodes = [operandNode];
        break;
      }
      default:
        break;
    }
    setNodes((nodes) => [...nodes, ...newNodes]);
    setEdges((edges) => [...edges, ...newEdges]);
  };

  // fixme: get the enum working again
  const onAddExpressionWithChildren = () => {
    const newExpressionNode: ExpressionNode = nodeFactory.createExpressionNode({
      drawer: {},
      value: {},
      column: data.column,
    });

    const newOperatorNode: OperatorNode = nodeFactory.createOperatorNode(
      {
        drawer: {},
        value: {},
        column: data.column,
      },
      newExpressionNode.id,
    );

    const newOperandNodeB: OperandNode = nodeFactory.createOperandNode(
      {
        drawer: {},
        value: {},
        column: data.column,
      },
      newExpressionNode.id,
    );

    const thisNode = nodes.find((n) => n.id === id)!;
    const updatedNode = {
      ...thisNode,
      parentNode: newExpressionNode.id,
      position: {
        x: 20,
        y: 20,
      },
    };
    setNodes((nodes) => [
      ...nodes.filter((node) => node.id !== id),
      newExpressionNode,
      updatedNode,
      newOperatorNode,
      newOperandNodeB,
    ]);

    // Check if we need to redirect an edge source(s) from the operand to the expression
    const existingEdges = edges.filter((e) => e.source === id);
    if (existingEdges.length > 0) {
      const updatedEdges = existingEdges.map((e) => ({
        ...e,
        source: newExpressionNode.id,
      }));
      setEdges((edges) => [
        ...edges.filter((edge) => !updatedEdges.map((e) => e.id).includes(edge.id)),
        ...updatedEdges,
      ]);
    }
  };

  const onRemoveNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  }, [id, setNodes, setEdges]);

  //kabob menu is only shown for node types that can be deleted
  const showMenu = nodeType !== "action" && nodeType !== "actionDriver" && nodeType !== "logic";

  const onKabobClick = (e: MouseEvent<HTMLElement>) => {
    if (isEditing && showMenu) {
      if (!selected) {
        updateMyPresence({ selectedNodeId: id });
        setHandleMenuDeleteClick(onRemoveNode);
        setNodeName("name" in data.value ? (data.value.name as string | undefined) : undefined);
      }
      setMenuAnchorElement(e.currentTarget);
      setMenuIsOpen(true);
      setHandleMenuDetailClick(onDetailClick);
    } else {
      onDetailClick();
    }
  };

  const isNotActionNode: boolean = nodeType !== "action"; // fixme: get enum working

  const showToolbar: boolean =
    isEditing && isLastNodeInColumn(nodes, data.column, yPos) && isNotActionNode;

  const isOperandNode = nodeType === "operand";

  const showAddExpression = showToolbar && isOperandNode;

  return (
    <Stack direction={"row"} spacing={1}>
      <Box
        sx={(theme) => ({
          width: width || 192, // is this not relative?
          // height: 140,
          paddingBottom: 1.5, // this is relative
          border: 2, // and this is not?
          borderRadius: theme.shape.borderRadius,
          borderColor: color.main,
          backgroundColor: "#fff",
        })}
      >
        <StyledHandle handles={handles} isEditing={isEditing} />
        <Box
          sx={() => ({
            width: "100%",
            height: 29,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 1.5,
            paddingRight: 1.5,
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
            backgroundColor: color.light,
            color: color.main,
          })}
        >
          <Typography>{title}</Typography>
          <Box onClick={onKabobClick}>
            <MoreVert
              sx={() => ({
                paddingTop: 1,
                transform: "scale(1.5)",
                color: color.main,
                position: "absolute",
                top: "-2px",
                right: "8px",
                cursor: "default",
              })}
            />
          </Box>
        </Box>
        <Box
          sx={() => ({
            width: "100%",
            paddingTop: 1,
            paddingLeft: 1.5,
            paddingRight: 1.5,
          })}
        >
          {children}
          {selected && (
            <Typography sx={{ marginTop: 1, fontWeight: "light", fontStyle: "italic" }}>
              {editorName} is editing
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "end",
            alignItems: "end",
            paddingTop: 2,
            paddingRight: 2,
            paddingBottom: 0.5,
          }}
          onClick={onDetailClick}
        >
          <Badge
            sx={(t) => ({
              "& .MuiBadge-badge": { backgroundColor: t.palette.highlight?.main, color: "white" },
            })}
            badgeContent={unreadNodeNotifications}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          />
        </Box>
      </Box>
      {showToolbar && (
        <Toolbar
          onAdd={onAddNode}
          onAddExpression={showAddExpression ? onAddExpressionWithChildren : undefined}
        />
      )}
    </Stack>
  );
}
