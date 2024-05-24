import { createCostOrBenefit, createNode } from "@/components/CustomForms/DecisionLogic/graphUtils";
import {
  CostOrBenefit,
  DecisionLogic,
  DecisionLogicAxis,
  DecisionLogicNode,
  DecisionLogicScoreNode,
  ScoringDetail,
} from "@/types";

/**
 * First pass at using a reducer for Decision Logic data
 * Action types and payloads are purposefully granular to make debugging easier (as opposed to Partial<T>)
 *
 * `edit-scoringDetail` takes the entire ScoringDetail object because it's not autosaved per the UI spec
 *
 * todos:
 *  - consider using Immer https://immerjs.github.io/immer/ to reduce verbosity
 *  - consider storing previous state in the object itself rather than using a ref
 *  - consider moving graph-diffing functionality into the reducer itself
 */

type Activity =
  | {
      type: "ref-editing-overwrite";
      state: DecisionLogic;
    }
  | {
      type: "change-actionType";
      axis: DecisionLogicAxis;
    }
  | {
      type: "change-outcomeType";
      axis: DecisionLogicAxis;
    }
  | {
      type: "edit-action";
      action: DecisionLogicNode;
    }
  | {
      type: "edit-outcome";
      outcome: DecisionLogicNode;
    }
  | {
      type: "new-action";
    }
  | {
      type: "new-outcome";
    }
  | {
      type: "edit-actionDecisionMethod";
      value: string;
    }
  | {
      type: "edit-limits";
      value: string;
    }
  | {
      type: "edit-instanceLogic";
      value: string;
    }
  | {
      type: "edit-numericScore";
      costOrBenefit: CostOrBenefit;
    }
  | {
      type: "new-numericScore";
    }
  | {
      type: "delete-numericScore";
      id: string;
    }
  | {
      type: "edit-scoringDetail";
      scoreId: string;
      detail: ScoringDetail;
    }
  | {
      type: "modify-scores";
      scores: DecisionLogicScoreNode[];
    }
  | {
      type: "modify-actions-and-scores";
      actions: DecisionLogicNode[];
      scores: DecisionLogicScoreNode[];
      numericScore: CostOrBenefit[];
    }
  | {
      type: "modify-outcomes-and-scores";
      outcomes: DecisionLogicNode[];
      scores: DecisionLogicScoreNode[];
      numericScore: CostOrBenefit[];
    };

export const decisionLogicReducer = (state: DecisionLogic, activity: Activity): DecisionLogic => {
  switch (activity.type) {
    case "ref-editing-overwrite": {
      return activity.state;
    }
    case "change-actionType": {
      return {
        ...state,
        actionType: activity.axis,
      };
    }
    case "change-outcomeType": {
      return {
        ...state,
        outcomeType: activity.axis,
      };
    }
    case "edit-action": {
      return {
        ...state,
        actions: state.actions.map((n) => {
          if (n.id === activity.action.id) {
            return activity.action;
          } else {
            return n;
          }
        }),
      };
    }
    case "edit-outcome": {
      return {
        ...state,
        outcomes: state.outcomes.map((n) => {
          if (n.id === activity.outcome.id) {
            return activity.outcome;
          } else {
            return n;
          }
        }),
      };
    }
    case "new-action": {
      return {
        ...state,
        actions: [...state.actions, createNode(`Action ${state.actions.length + 1}`)],
      };
    }
    case "new-outcome": {
      return {
        ...state,
        outcomes: [...state.outcomes, createNode(`Outcome ${state.outcomes.length + 1}`)],
      };
    }
    case "edit-actionDecisionMethod": {
      return {
        ...state,
        actionDecisionMethod: activity.value,
      };
    }
    case "edit-limits": {
      return {
        ...state,
        limits: activity.value,
      };
    }
    case "edit-instanceLogic": {
      return {
        ...state,
        instanceLogic: activity.value,
      };
    }
    case "edit-numericScore": {
      return {
        ...state,
        numericScore: state.numericScore.map((x) =>
          x.id === activity.costOrBenefit.id ? activity.costOrBenefit : x,
        ),
      };
    }
    case "new-numericScore": {
      return {
        ...state,
        numericScore: [...(state.numericScore ?? []), createCostOrBenefit()],
      };
    }
    case "delete-numericScore": {
      return {
        ...state,
        numericScore: state.numericScore.filter((x) => x.id !== activity.id),
      };
    }
    case "edit-scoringDetail": {
      return {
        ...state,
        scores: state.scores.map((x) => {
          if (x.id === activity.scoreId) {
            return {
              ...x,
              detail: activity.detail,
            };
          } else {
            return x;
          }
        }),
      };
    }
    case "modify-scores": {
      return {
        ...state,
        scores: activity.scores,
      };
    }
    case "modify-actions-and-scores": {
      return {
        ...state,
        actions: activity.actions,
        scores: activity.scores,
        numericScore: activity.numericScore,
      };
    }
    case "modify-outcomes-and-scores": {
      return {
        ...state,
        outcomes: activity.outcomes,
        scores: activity.scores,
        numericScore: activity.numericScore,
      };
    }
  }
};
