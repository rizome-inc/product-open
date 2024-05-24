import { ReadOnlyText } from "@/components/CustomForms/ReadOnlyText";
import { InputField } from "@/components/InputField";
import { useFlowProjectEditingContext } from "@/context/flowProject";
import { useSelf, useUpdateMyPresence } from "@/liveblocks.config";
import { Theme } from "@/styles/theme";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ChangeEvent, useEffect, useState } from "react";
import { Handle, NodeProps, Position, useReactFlow } from "reactflow";
import { ControlledSelect } from "../components/ControlledSelect";
import { StyledHandle } from "../components/StyledHandle";
import { useNodeSelections } from "../hooks/useSelectedByOther";
import { Base, OperandNodeValue, OperandSource } from "../store/dataTypes";
import NodeFactory from "../store/nodeFactory";
import BaseNodeElement, { BaseNodeProps } from "./BaseNode";

export default function OperandNodeElement(props: NodeProps<Base<OperandNodeValue>>) {
  const { id, data, ...otherNodeProps } = props;

  const { isEditing, liveblocksStore } = useFlowProjectEditingContext();

  const updateMyPresence = useUpdateMyPresence();
  const { onNodeValueEdit, nodes } = liveblocksStore();
  const self = useSelf();
  const { selectionStatus } = useNodeSelections();
  const { setNodes, setEdges } = useReactFlow();
  const { selected } = selectionStatus(id, self.id);

  const [selectOpen, setSelectOpen] = useState(false);

  const nodeFactory = new NodeFactory();

  useEffect(() => {
    updateMyPresence({ selectedNodeId: selectOpen ? id : null });
  }, [id, selectOpen, updateMyPresence]);

  const onNameInputChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onNodeValueEdit<OperandNodeValue>(id, {
      name: e.target.value,
      source: data.value.source,
    });
  };

  // select uses a different signature
  // todo: move some of these operations into a hook so we can use them elsewhere too
  const onSourceInputChange = (value: string) => {
    if (value === "") {
      // Delete edges that target this node
      setEdges((es) => es.filter((e) => e.target !== id));
    } else if (data.value.source !== "Prediction" && value === "Prediction") {
      // Add supporting model and data nodes, with edges from data->model->operand
      const created = nodeFactory.createModelNode({
        value: {},
        drawer: {},
        column: 1,
      });
      const modelNode = created.nodes.find((n) => n.type === "model");
      if (modelNode) {
        created.edges.push(nodeFactory.createEdge(modelNode.id, id));
      }
      setNodes((nodes) => [...nodes, ...created.nodes]);
      // Delete edges that target this node whose source is a dataNode
      setEdges((edges) => [
        ...edges.filter((e) => {
          const sources = nodes.filter(
            (n) => n.id === e.source && e.target === id && n.type === "dataNode",
          );
          return !sources.map((n) => n.id).includes(e.source);
        }),
        ...created.edges,
      ]);
    } else if (data.value.source !== "Calculation" && value === "Calculation") {
      // Add supporting data node, with edge from data->operand
      const dataNode = nodeFactory.createDataNode({
        value: {},
        drawer: {},
        column: 0,
      });
      const edge = nodeFactory.createEdge(dataNode.id, id);
      setNodes((nodes) => [...nodes, dataNode]);
      // Delete edges that target this node whose source is a modelNode
      setEdges((edges) => [
        ...edges.filter((e) => {
          const sources = nodes.filter(
            (n) => n.id === e.source && e.target === id && n.type === "model",
          );
          return !sources.map((n) => n.id).includes(e.source);
        }),
        edge,
      ]);
    }
    onNodeValueEdit<OperandNodeValue>(id, {
      name: data.value.name,
      source: value as OperandSource,
    });
  };

  const isInExpression = nodes.find((n) => n.id === id)?.parentNode !== undefined;

  const handles = [
    <StyledHandle
      key="styled-handle-0"
      handles={[<Handle key="handle-1" type="target" position={Position.Left} />]}
      isEditing={isEditing}
    />,
  ];

  if (!isInExpression) {
    handles.push(
      <StyledHandle
        key="styled-handle-1"
        handles={[<Handle key="handle-1" type="source" position={Position.Right} />]}
        isEditing={isEditing}
      />,
    );
  }

  const baseNodeProps: BaseNodeProps = {
    handles,
    color: Theme.palette.primary,
    title: isEditing ? "Math" : data.value?.source || "Math",
    value: data.value,
    drawer: data.drawer,
    column: data.column,
    children: [
      isEditing ? (
        <Box key="o-node-1">
          <Typography variant="em" component={"label"}>
            Name of numeric value
          </Typography>
          <InputField
            onChange={onNameInputChange}
            value={data.value?.name || ""}
            onFocus={() => updateMyPresence({ selectedNodeId: id })}
            onBlur={() => updateMyPresence({ selectedNodeId: null })}
            disabled={selected}
          />
          <Typography variant="em" component={"label"}>
            Source
          </Typography>
          <ControlledSelect
            open={selectOpen}
            setOpen={setSelectOpen}
            value={data.value?.source || ""}
            onChange={onSourceInputChange}
            disabled={selected}
            options={[
              {
                label: "None",
                value: "",
              },
              {
                label: "Calculation",
                value: "Calculation",
              },
              {
                label: "Prediction",
                value: "Prediction",
              },
            ]}
          />
        </Box>
      ) : (
        <Box key="o-node-1">
          <ReadOnlyText value={data.value?.name || ""} />
        </Box>
      ),
    ],
  };

  return (
    <BaseNodeElement data={baseNodeProps} key={`basenode-${id}`} id={id} {...otherNodeProps} />
  );
}
