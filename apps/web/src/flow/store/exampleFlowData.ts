import { Edge, Node } from "reactflow";
import NodeFactory from "./nodeFactory";

const factory = new NodeFactory(false);

const data1 = factory.createDataNode({
  value: {
    name: "Incident Logs",
  },
  drawer: {
    inputValue1: "",
  },
  column: 0,
});

const data2 = factory.createDataNode({
  value: {
    name: "Maintenance Logs",
  },
  drawer: {
    inputValue1: "",
  },
  column: 0,
});

const model1 = factory.createModelNode({
  value: {
    name: "Predict risk of an incident for this part",
  },
  drawer: {
    inputValue1: "",
  },
  column: 1,
}).nodes[0];

const expressionA = factory.createExpressionNode({
  value: {},
  drawer: {},
  column: 2,
});

const operandA1 = factory.createOperandNode(
  {
    value: {
      name: "Risk of incident",
      source: "Prediction",
    },
    drawer: {
      inputValue1: "",
    },
    column: 2,
  },
  expressionA.id,
);

const operatorA = factory.createOperatorNode(
  {
    value: {
      operator: "Multiply",
    },
    drawer: {},
    column: 2,
  },
  expressionA.id,
);

const operandA2 = factory.createOperandNode(
  {
    value: {
      name: "Cost of incident",
      source: "Calculation",
    },
    drawer: {
      inputValue1: "",
    },
    column: 2,
  },
  expressionA.id,
);

const expressionB = factory.createExpressionNode({
  value: {},
  drawer: {},
  column: 3,
});

const operandB1 = factory.createOperandNode(
  {
    value: {
      name: "Expected loss without maintenance",
      source: "Calculation",
    },
    drawer: {
      inputValue1: "",
    },
    column: 3,
  },
  expressionB.id,
);

const operatorB = factory.createOperatorNode(
  {
    value: {
      operator: "Subtract",
    },
    drawer: {},
    column: 3,
  },
  expressionB.id,
);

const operandB2 = factory.createOperandNode(
  {
    value: {
      name: "Cost of maintenance",
      source: "Calculation",
    },
    drawer: {
      inputValue1: "",
    },
    column: 3,
  },
  expressionB.id,
);

const actionDriver = factory.createActionDriverNode({
  value: {
    actionDriver: '"Benefit of maintenance" score for each part in the factory',
  },
  drawer: {
    inputValue1: "",
  },
  column: 4,
});

const logic = factory.createLogicNode({
  value: {
    logic: "Stack scores from highest to lowest",
  },
  drawer: {
    inputValue1: "",
  },
  column: 4,
});

const action = factory.createActionNode({
  value: {
    prompt:
      "A backlog of maintenance items will be updated each week to support the maintenance team's prioritization",
    dynamicImage: undefined,
    staticImageUrl:
      "https://tvrwyqwuohyjxqocjsuz.supabase.co/storage/v1/object/public/static/maintenance_backlog.png",
  },
  drawer: {
    inputValue1: "",
  },
  column: 4,
});

export const exampleNodes: Node[] = [
  data1,
  data2,
  model1,
  expressionA,
  operandA1,
  operatorA,
  operandA2,
  expressionB,
  operandB1,
  operatorB,
  operandB2,
  actionDriver,
  logic,
  action,
];
export const exampleEdges: Edge[] = [
  [data1.id, model1.id],
  [data1.id, operandA2.id],
  [data2.id, operandB2.id],
  [model1.id, operandA1.id],
  [expressionA.id, operandB1.id],
  [expressionB.id, actionDriver.id],
  [actionDriver.id, logic.id],
  [logic.id, action.id],
].map((nodes) => factory.createEdge(nodes[0], nodes[1]));
