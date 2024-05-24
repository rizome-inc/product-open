import { Stack } from "@mui/system";
import { NodeToolbar, Position } from "reactflow";
import AddButton from "./AddButton";
import AddExpressionButton from "./AddExpressionButton";

export type ToolbarProps = {
  onAdd?: () => void;
  onAddExpression?: () => void;
};

// todo: child alignment is off
export default function Toolbar({ onAdd, onAddExpression }: ToolbarProps) {
  return (
    <NodeToolbar isVisible={true} position={Position.Bottom} align="center" offset={18}>
      <Stack direction="row" spacing={1} alignItems="center">
        {onAdd && <AddButton handleClick={onAdd} />}
        {onAddExpression && <AddExpressionButton handleClick={onAddExpression} />}
      </Stack>
    </NodeToolbar>
  );
}
