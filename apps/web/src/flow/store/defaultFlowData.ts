import { Edge, Node } from "reactflow";
import NodeFactory from "./nodeFactory";

const factory = new NodeFactory(false);

const data1 = factory.createDataNode({
  value: {
    name: "",
  },
  drawer: {
    inputValue1: "",
  },
  column: 0,
});

const model1 = factory.createModelNode({
  value: {
    name: "",
  },
  drawer: {
    inputValue1: "",
  },
  column: 1,
}).nodes[0];

const operand1 = factory.createOperandNode({
  value: {
    name: "",
    source: "Prediction",
  },
  drawer: {
    inputValue1: "",
  },
  column: 2,
});

const actionDriver = factory.createActionDriverNode({
  value: {
    actionDriver: "",
  },
  drawer: {
    inputValue1: "",
  },
  column: 3,
});

const logic = factory.createLogicNode({
  value: {
    logic: "",
  },
  drawer: {
    inputValue1: "",
  },
  column: 3,
});

const action = factory.createActionNode({
  value: {
    prompt: undefined,
    dynamicImage: undefined,
    staticImageUrl: undefined,
  },
  drawer: {
    inputValue1: "",
  },
  column: 3,
});

export const defaultNodes: Node[] = [data1, model1, operand1, actionDriver, logic, action];
export const defaultEdges: Edge[] = [
  [data1.id, model1.id],
  [model1.id, operand1.id],
  [operand1.id, actionDriver.id],
  [actionDriver.id, logic.id],
  [logic.id, action.id],
].map((nodes) => factory.createEdge(nodes[0], nodes[1]));

// [
//   factory.createEdge(data1.id, model1.id),
//   factory.createEdge(model1.id, operand1.id),
//   factory.createEdge(operand1.id, actionDriver.id),
//   factory.createEdge(actionDriver.id, logic.id),
//   factory.createEdge(logic.id, action.id)
// ];
