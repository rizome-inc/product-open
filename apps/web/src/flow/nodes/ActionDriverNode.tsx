import { ReadOnlyText } from "@/components/CustomForms/ReadOnlyText";
import { InputField } from "@/components/InputField";
import { useFlowProjectEditingContext } from "@/context/flowProject";
import { useSelf, useUpdateMyPresence } from "@/liveblocks.config";
import { Theme } from "@/styles/theme";
import { ChangeEvent } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { StyledHandle } from "../components/StyledHandle";
import { useNodeSelections } from "../hooks/useSelectedByOther";
import { ActionDriverNodeValue, Base } from "../store/dataTypes";
import BaseNodeElement, { BaseNodeProps } from "./BaseNode";

export default function ActionDriverNodeElement(props: NodeProps<Base<ActionDriverNodeValue>>) {
  const { id, data, ...otherNodeProps } = props;

  const { isEditing, liveblocksStore } = useFlowProjectEditingContext();

  const updateMyPresence = useUpdateMyPresence();
  const { onNodeValueEdit } = liveblocksStore();

  const self = useSelf();
  const { selectionStatus } = useNodeSelections();
  const { selected } = selectionStatus(id, self.id);

  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onNodeValueEdit<ActionDriverNodeValue>(id, {
      actionDriver: e.target.value,
    });
  };

  const baseNodeProps: BaseNodeProps = {
    handles: [
      <StyledHandle
        key="styled-handle-0"
        handles={[
          <Handle key="handle-0" type="source" position={Position.Bottom} />,
          <Handle key="handle-1" type="target" position={Position.Left} />,
        ]}
        isEditing={isEditing}
      />,
    ],
    color: Theme.palette.primary,
    title: "Action-driving number",
    value: data.value,
    drawer: data.drawer,
    column: data.column,
    width: 328,
    children: [
      isEditing ? (
        <InputField
          key={`ad-node-1`}
          onChange={onInputChange}
          value={data.value?.actionDriver || ""}
          label="Number that will drive the above action"
          onFocus={() => updateMyPresence({ selectedNodeId: id })}
          onBlur={() => updateMyPresence({ selectedNodeId: null })}
          disabled={selected}
        />
      ) : (
        <ReadOnlyText key={`ad-node-1`} value={data.value?.actionDriver || ""} />
      ),
    ],
  };

  return (
    <BaseNodeElement data={baseNodeProps} id={id} key={`basenode-${id}`} {...otherNodeProps} />
  );
}
