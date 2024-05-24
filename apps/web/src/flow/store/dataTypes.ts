import { Node } from "reactflow";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NodeValues extends Object {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DrawerValues extends Object {}

export interface ActionNodeValue extends NodeValues {
  prompt?: string;
  dynamicImage?: {
    path: string;
    signedUrl: string;
    signedUrlExpiration: Date;
  };
  staticImageUrl?: string;
}

export interface LogicNodeValue extends NodeValues {
  logic?: string;
}

export interface ActionDriverNodeValue extends NodeValues {
  actionDriver?: string;
}

// todo: use this more consistently
export type OperandSource = "Calculation" | "Prediction" | undefined;

export interface OperandNodeValue extends NodeValues {
  name?: string;
  source?: OperandSource;
}

export interface OperatorNodeValue extends NodeValues {
  operator?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExpressionNodeValue extends NodeValues {}

export interface ModelNodeValue extends NodeValues {
  name?: string;
}

export interface DataNodeValue extends NodeValues {
  name?: string;
}

export interface DefaultDrawerValue extends DrawerValues {
  inputValue1?: string;
}

export type Base<NodeValue = NodeValues, DrawerValue = DefaultDrawerValue> = {
  // id: string;
  // type: NodeTypeKey;
  column: number;
  value: NodeValue;
  drawer: DrawerValue;
  height?: number;
};

export type DataNode = Node<Base<DataNodeValue>, "dataNode">;
export type ModelNode = Node<Base<ModelNodeValue>, "model">;
export type OperandNode = Node<Base<OperandNodeValue>, "operand">;
export type OperatorNode = Node<Base<OperatorNodeValue>, "operator">;
export type ExpressionNode = Node<Base<ExpressionNodeValue>, "expression">;
export type LogicNode = Node<Base<LogicNodeValue>, "logic">;
export type ActionDriverNode = Node<Base<ActionDriverNodeValue>, "actionDriver">;
export type ActionNode = Node<Base<ActionNodeValue>, "action">;
