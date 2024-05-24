import { Edge, Node } from "reactflow";
import { v4 as uuidgen } from "uuid";
import {
  ActionDriverNode,
  ActionDriverNodeValue,
  ActionNode,
  ActionNodeValue,
  Base,
  DataNode,
  DataNodeValue,
  ExpressionNode,
  ExpressionNodeValue,
  LogicNode,
  LogicNodeValue,
  ModelNode,
  ModelNodeValue,
  OperandNode,
  OperandNodeValue,
  OperatorNode,
  OperatorNodeValue,
} from "./dataTypes";

export type Created<T = Node> = {
  nodes: T[];
  edges: Edge[];
};

class NodeFactory {
  recursive: boolean;
  constructor(recursive = true) {
    this.recursive = recursive;
  }

  createDataNode(data: Base<DataNodeValue>): DataNode {
    return {
      id: uuidgen(),
      data,
      position: { x: 0, y: 0 },
      type: "dataNode", // NodeTypeKey.DataNode, //fixme: why does react complain that this is undefined?
    };
  }

  createModelNode(data: Base<ModelNodeValue>): Created<ModelNode | (ModelNode | DataNode)> {
    const modelNode: ModelNode = {
      id: uuidgen(),
      data,
      position: { x: 0, y: 0 },
      type: "model",
    };
    if (!this.recursive) {
      return {
        nodes: [modelNode],
        edges: [],
      };
    }
    const dataNode: DataNode = this.createDataNode({
      column: data.column - 1,
      value: {},
      drawer: {},
    });
    const edge = this.createEdge(dataNode.id, modelNode.id);
    return {
      nodes: [modelNode, dataNode],
      edges: [edge],
    };
  }

  createExpressionNode(data: Base<ExpressionNodeValue>): ExpressionNode {
    return {
      id: uuidgen(),
      data,
      position: { x: 0, y: 0 },
      type: "expression",
    };
  }

  createOperandNode(data: Base<OperandNodeValue>, parentNode?: string): OperandNode {
    if (parentNode) {
      return {
        id: uuidgen(),
        data,
        position: { x: 0, y: 0 },
        type: "operand",
        extent: "parent",
        draggable: false,
        parentNode,
      };
    } else {
      return {
        id: uuidgen(),
        data,
        position: { x: 0, y: 0 },
        type: "operand",
      };
    }
  }

  createOperatorNode(data: Base<OperatorNodeValue>, parentNode: string): OperatorNode {
    return {
      id: uuidgen(),
      data,
      position: { x: 0, y: 0 },
      type: "operator",
      extent: "parent",
      draggable: false,
      parentNode,
    };
  }

  createActionDriverNode(data: Base<ActionDriverNodeValue>): ActionDriverNode {
    return {
      id: uuidgen(),
      data,
      position: { x: 0, y: 0 },
      type: "actionDriver",
    };
  }

  createLogicNode(data: Base<LogicNodeValue>): LogicNode {
    return {
      id: uuidgen(),
      data,
      position: { x: 0, y: 0 },
      type: "logic",
    };
  }

  createActionNode(data: Base<ActionNodeValue>): ActionNode {
    return {
      id: uuidgen(),
      data,
      position: { x: 0, y: 0 },
      type: "action",
    };
  }

  createEdge(sourceId: string, targetId: string): Edge {
    return {
      id: `edge-${uuidgen()}`,
      source: sourceId,
      target: targetId,
      type: "smart",
    };
  }
}

export default NodeFactory;
