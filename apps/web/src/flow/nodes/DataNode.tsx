import { ReadOnlyText } from "@/components/CustomForms/ReadOnlyText";
import { InputField } from "@/components/InputField";
import { useFlowProjectEditingContext } from "@/context/flowProject";
import { useSelf, useUpdateMyPresence } from "@/liveblocks.config";
import { Theme } from "@/styles/theme";
import { ChangeEvent } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { StyledHandle } from "../components/StyledHandle";
import { useNodeSelections } from "../hooks/useSelectedByOther";
import { Base, DataNodeValue } from "../store/dataTypes";
import BaseNodeElement, { BaseNodeProps } from "./BaseNode";

export default function DataNodeElement(props: NodeProps<Base<DataNodeValue>>) {
  const { id, data, ...otherNodeProps } = props;

  const { isEditing, liveblocksStore } = useFlowProjectEditingContext();

  const updateMyPresence = useUpdateMyPresence();
  const { onNodeValueEdit } = liveblocksStore();

  const self = useSelf();
  const { selectionStatus } = useNodeSelections();
  const { selected } = selectionStatus(id, self.id);

  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onNodeValueEdit<DataNodeValue>(id, {
      name: e.target.value,
    });
  };

  const baseNodeProps: BaseNodeProps = {
    handles: [
      <StyledHandle
        key={"handle-0"}
        handles={[<Handle key="handle-0" type="source" position={Position.Right} />]}
        isEditing={isEditing}
      />,
    ],
    color: Theme.palette.warning,
    title: "Data",
    value: data.value,
    drawer: data.drawer,
    column: data.column,
    children: [
      isEditing ? (
        <InputField
          key={`d-node-1`}
          onChange={onInputChange}
          value={data.value?.name || ""}
          label="Name of data source"
          onFocus={() => updateMyPresence({ selectedNodeId: id })}
          onBlur={() => updateMyPresence({ selectedNodeId: null })}
          disabled={selected}
        />
      ) : (
        <ReadOnlyText key={`d-node-1`} value={data.value?.name || ""} />
      ),
    ],
  };

  return (
    <BaseNodeElement data={baseNodeProps} key={`basenode-${id}`} id={id} {...otherNodeProps} />
  );
}
