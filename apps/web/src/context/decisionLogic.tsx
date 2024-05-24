import {
  createCostOrBenefit,
  createNode,
  createScoreNode,
} from "@/components/CustomForms/DecisionLogic/graphUtils";
import { useContextGuard } from "@/hooks/contextGuard";
import { usePrevious } from "@/hooks/usePrevious";
import { decisionLogicReducer } from "@/reducers/decisionLogic";
import {
  CostOrBenefit,
  CustomFormFieldProps,
  DecisionLogic,
  DecisionLogicAxis,
  DecisionLogicScoreNode,
  decisionLogicSchema,
} from "@/types";
import * as React from "react";

export type DecisionLogicContextProps = Required<
  Pick<
    CustomFormFieldProps<DecisionLogic>,
    "formField" | "isEditing" | "getValue" | "onValueChanged"
  >
>;

const createInitialState = ({
  getValue,
}: Pick<CustomFormFieldProps<DecisionLogic>, "getValue">): DecisionLogic => {
  if (getValue()) return getValue()!;

  // Apply defaults set in DecisionLogicSchema
  const partialDefault: Omit<DecisionLogic, "scores"> = decisionLogicSchema.parse({
    actions: [createNode("Action 1"), createNode("Action 2")],
    outcomes: [createNode("Outcome 1"), createNode("Outcome 2")],
    numericScore: [createCostOrBenefit()],
  });
  return {
    ...partialDefault,
    scores: partialDefault.actions.flatMap((a) =>
      partialDefault.outcomes.map((o) => createScoreNode(a.id, o.id)),
    ),
  };
};

export const useDecisionLogicContextController = ({
  formField,
  isEditing,
  getValue,
  onValueChanged,
}: DecisionLogicContextProps) => {
  const [decisionLogic, dispatch] = React.useReducer(
    decisionLogicReducer,
    { formField, getValue },
    createInitialState,
  );

  React.useEffect(() => {
    onValueChanged(decisionLogic);
  }, [decisionLogic, onValueChanged]);

  // Used for graph diffing
  // todo: consider creating an `.is(value).was(value)` api of sorts for simpler comparison
  const previousDecisionLogic = usePrevious(decisionLogic);

  // Graph differ
  React.useEffect(() => {
    if (!previousDecisionLogic) return;
    const {
      actions: previousActions,
      outcomes: previousOutcomes,
      actionType: previousActionType,
      outcomeType: previousOutcomeType,
    } = previousDecisionLogic;

    const { actions, outcomes, actionType, outcomeType, scores } = decisionLogic;

    // dev note: This is set up as inexhaustive conditionals to keep updates limited to one rule at a time
    // Action: Discrete --> Numeric
    if (
      actionType === DecisionLogicAxis.Numeric &&
      previousActionType === DecisionLogicAxis.Discrete
    ) {
      // Reset scores -- fixme: determine how to pick which scores are saved in the future
      let newScores: DecisionLogicScoreNode[] = [];
      if (outcomeType === DecisionLogicAxis.Discrete) {
        newScores = outcomes.map((o) => createScoreNode(undefined, o.id));
      }
      dispatch({
        type: "modify-scores",
        scores: newScores,
      });
    }
    // Action: Numeric --> Discrete
    else if (
      actionType === DecisionLogicAxis.Discrete &&
      previousActionType === DecisionLogicAxis.Numeric
    ) {
      const newActions = [createNode("Action 1"), createNode("Action 2")];
      let newScores: DecisionLogicScoreNode[] = [];
      const newNumericScore: CostOrBenefit[] = [];
      if (outcomeType === DecisionLogicAxis.Discrete) {
        const updatedScores = scores.map((s) => {
          return {
            ...s,
            actionId: newActions[0].id,
          };
        });
        newScores = [
          ...updatedScores,
          ...updatedScores.map((s) => createScoreNode(newActions[1].id, s.outcomeId)),
        ];
      } else {
        newScores = newActions.map((a) => createScoreNode(a.id));
      }
      dispatch({
        type: "modify-actions-and-scores",
        actions: newActions,
        scores: newScores,
        numericScore: newNumericScore,
      });
    }
    // Action: add action
    else if (
      actionType === DecisionLogicAxis.Discrete &&
      previousActionType === DecisionLogicAxis.Discrete &&
      actions.length > previousActions.length
    ) {
      const newAction = actions.find((a) => !previousActions.includes(a))!;
      let newScores: DecisionLogicScoreNode[] = [];
      if (outcomeType === DecisionLogicAxis.Discrete) {
        newScores = outcomes.map((o) => createScoreNode(newAction.id, o.id));
      } else {
        newScores = [createScoreNode(newAction.id)];
      }
      dispatch({
        type: "modify-scores",
        scores: [...decisionLogic.scores, ...newScores],
      });
    }
    // Action: delete action

    // Outcome: Discrete --> Numeric
    else if (
      outcomeType === DecisionLogicAxis.Numeric &&
      previousOutcomeType === DecisionLogicAxis.Discrete
    ) {
      // Reset scores -- fixme: determine how to pick which scores are saved in the future
      let newScores: DecisionLogicScoreNode[] = [];
      if (actionType === DecisionLogicAxis.Discrete) {
        newScores = actions.map((a) => createScoreNode(a.id, undefined));
      }
      dispatch({
        type: "modify-scores",
        scores: newScores,
      });
    }
    // Outcome: Numeric --> Discrete
    else if (
      outcomeType === DecisionLogicAxis.Discrete &&
      previousOutcomeType === DecisionLogicAxis.Numeric
    ) {
      const newOutcomes = [createNode("Outcome 1"), createNode("Outcome 2")];
      let newScores: DecisionLogicScoreNode[] = [];
      const newNumericScore: CostOrBenefit[] = [];
      if (actionType === DecisionLogicAxis.Discrete) {
        const updatedScores = scores.map((s) => {
          return {
            ...s,
            outcomeId: newOutcomes[0].id,
          };
        });
        newScores = [
          ...updatedScores,
          ...updatedScores.map((s) => createScoreNode(s.actionId, newOutcomes[1].id)),
        ];
      } else {
        newScores = newOutcomes.map((o) => createScoreNode(undefined, o.id));
      }
      dispatch({
        type: "modify-outcomes-and-scores",
        outcomes: newOutcomes,
        scores: newScores,
        numericScore: newNumericScore,
      });
    }
    // Outcome: add outcome
    else if (
      outcomeType === DecisionLogicAxis.Discrete &&
      previousOutcomeType === DecisionLogicAxis.Discrete &&
      outcomes.length > previousOutcomes.length
    ) {
      const newOutcome = outcomes.find((o) => !previousOutcomes.includes(o))!;
      let newScores: DecisionLogicScoreNode[] = [];
      if (actionType === DecisionLogicAxis.Discrete) {
        newScores = actions.map((a) => createScoreNode(a.id, newOutcome.id));
      } else {
        newScores = [createScoreNode(undefined, newOutcome.id)];
      }
      dispatch({
        type: "modify-scores",
        scores: [...decisionLogic.scores, ...newScores],
      });
    }
    // Outcome: delete outcome
  }, [decisionLogic, previousDecisionLogic, dispatch]);

  return {
    isEditing,
    decisionLogic,
    dispatch,
  } as const;
};

export const DecisionLogicContext = React.createContext<ReturnType<
  typeof useDecisionLogicContextController
> | null>(null);

export const useDecisionLogicContext = () =>
  useContextGuard(DecisionLogicContext, "DecisionLogicContext");
