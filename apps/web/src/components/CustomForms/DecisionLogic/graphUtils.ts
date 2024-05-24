import { CostOrBenefit, DecisionLogicNode, DecisionLogicScoreNode } from "@/types";
import { v4 as uuidgen } from "uuid";

export const createNode = (value: string): DecisionLogicNode => {
  return { id: uuidgen(), value };
};

export const createScoreNode = (actionId?: string, outcomeId?: string): DecisionLogicScoreNode => {
  return {
    id: uuidgen(),
    actionId,
    outcomeId,
  };
};

export const createCostOrBenefit = (): CostOrBenefit => {
  return {
    id: uuidgen(),
    name: "",
    type: "Cost",
    calculationManner: "",
    logicDescription: "",
  };
};
