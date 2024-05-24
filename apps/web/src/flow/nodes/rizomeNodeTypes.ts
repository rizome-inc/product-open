import { NodeTypes } from "reactflow";
import ActionDriverNodeElement from "./ActionDriverNode";
import ActionNodeElement from "./ActionNode";
import DataNodeElement from "./DataNode";
import ExpressionNodeElement from "./ExpressionNode";
import LogicNodeElement from "./LogicNode";
import ModelNodeElement from "./ModelNode";
import OperandNodeElement from "./OperandNode";
import OperatorNodeElement from "./OperatorNode";

// todo: this should be defined in xylem
export enum NodeTypeKey {
  DataNode = "dataNode",
  Model = "model",
  Operand = "operand",
  Operator = "operator",
  Expression = "expression", // this is the parent node for math stuff
  Logic = "logic",
  ActionDriver = "actionDriver",
  Action = "action",
}

/**
 * Utility to determine which enum key corresponds with a value
 */
export const isNodeTypeKey = (value: string): value is NodeTypeKey =>
  Object.values(NodeTypeKey)
    .map((v) => v.toString())
    .includes(value);

// export type NodeTypeKey = "dataNode" | "model" | "operand" | "operator" | "expression" | "logic" | "actionDriver" | "action";

export const rizomeNodeTypes: NodeTypes = {
  [NodeTypeKey.DataNode]: DataNodeElement,
  [NodeTypeKey.Model]: ModelNodeElement,
  [NodeTypeKey.Expression]: ExpressionNodeElement,
  [NodeTypeKey.Operand]: OperandNodeElement,
  [NodeTypeKey.Operator]: OperatorNodeElement,
  [NodeTypeKey.ActionDriver]: ActionDriverNodeElement,
  [NodeTypeKey.Logic]: LogicNodeElement,
  [NodeTypeKey.Action]: ActionNodeElement,
};
