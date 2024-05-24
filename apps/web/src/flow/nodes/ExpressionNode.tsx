import { useFlowProjectEditingContext } from "@/context/flowProject";
import { Theme } from "@/styles/theme";
import { Box } from "@mui/system";
import { Handle, NodeProps, Position, useReactFlow } from "reactflow";
import { v4 as uuidgen } from "uuid";
import { StyledHandle } from "../components/StyledHandle";
import Toolbar from "../components/Toolbar";
import { Base, ExpressionNodeValue, OperandNode } from "../store/dataTypes";
import { isLastNodeInColumn } from "./BaseNode";

export default function ExpressionNodeElement(props: NodeProps<Base<ExpressionNodeValue>>) {
  const { isEditing, liveblocksStore } = useFlowProjectEditingContext();
  const { data, yPos } = props;
  const { nodes } = liveblocksStore();

  const { setNodes } = useReactFlow();

  const onAddNode = () => {
    const newNode: OperandNode = {
      id: uuidgen(),
      data: {
        drawer: {},
        value: {},
        column: data.column,
      },
      type: "operand",
      position: {
        x: data.column * 292,
        y: yPos + 508, // default position -- will be updated by autolayout
      },
    };
    setNodes((nodes) => [...nodes, newNode]);
  };

  const showToolbar = isEditing && isLastNodeInColumn(nodes, data.column, yPos);

  return (
    <>
      <Box
        sx={() => ({
          width: 232, // is this not relative?
          height: isEditing ? 508 : 421, // should be 302 for read mode, but only if node position is correct
          padding: 2,
          borderRight: "2px solid", // and this is not?
          borderTopRightRadius: 0,
          borderTopLeftRadius: Theme.shape.borderRadius * 2,
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: Theme.shape.borderRadius * 2,
          borderColor: Theme.palette.divider,
          backgroundColor: "#ddd",
        })}
      >
        <StyledHandle
          handles={[<Handle key="handle-0" type="source" position={Position.Right} />]}
          isEditing={isEditing}
          isExpression={true}
        />
      </Box>
      {showToolbar && <Toolbar onAdd={onAddNode} />}
    </>
  );
}
