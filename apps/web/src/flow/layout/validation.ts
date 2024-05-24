import { Connection, Node } from "reactflow";
import { NodeTypeKey, isNodeTypeKey } from "../nodes/rizomeNodeTypes";
import { OperandNode } from "../store/dataTypes";

const validateEdge = (sourceType: NodeTypeKey, targetType: NodeTypeKey): boolean => {
  let allowedTargets: NodeTypeKey[] = [];
  switch (sourceType) {
    case NodeTypeKey.DataNode: {
      allowedTargets = [NodeTypeKey.Model, NodeTypeKey.Operand];
      break;
    }
    case NodeTypeKey.Model: {
      allowedTargets = [NodeTypeKey.Operand];
      break;
    }
    case NodeTypeKey.Operand: {
      allowedTargets = [NodeTypeKey.Operand, NodeTypeKey.ActionDriver];
      break;
    }
    case NodeTypeKey.Operator: {
      break;
    }
    case NodeTypeKey.Expression: {
      allowedTargets = [NodeTypeKey.Operand, NodeTypeKey.ActionDriver];
      break;
    }
    case NodeTypeKey.ActionDriver: {
      allowedTargets = [NodeTypeKey.Logic];
      break;
    }
    case NodeTypeKey.Logic: {
      allowedTargets = [NodeTypeKey.Action];
      break;
    }
    case NodeTypeKey.Action: {
      break;
    }
    default: {
      return false;
    }
  }
  return allowedTargets.includes(targetType);
};

const validateOperandConnection = (sourceNode: Node, targetNode: Node): boolean => {
  if (
    targetNode.type !== "operand" ||
    !sourceNode.type ||
    !["dataNode", "model"].includes(sourceNode.type)
  )
    return true;
  const castTarget = targetNode as OperandNode;
  if (sourceNode.type === "dataNode" && castTarget.data.value.source === "Calculation") return true;
  if (sourceNode.type === "model" && castTarget.data.value.source === "Prediction") return true;
  return false;
};

export const isValidConnection = (nodes: Node[]) => (connection: Connection) => {
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);
  if (sourceNode?.type && isNodeTypeKey(sourceNode.type)) {
    const sourceType = sourceNode.type;
    if (targetNode?.type && isNodeTypeKey(targetNode.type)) {
      const targetType = targetNode.type;
      return (
        validateEdge(sourceType, targetType) && validateOperandConnection(sourceNode, targetNode)
      );
    }
  }
  return false;
};
