import {
  DecisionLogicContext,
  DecisionLogicContextProps,
  useDecisionLogicContext,
  useDecisionLogicContextController,
} from "@/context/decisionLogic";
import { DecisionLogicAxis } from "@/types";
import { Stack, Typography } from "@mui/material";
import * as React from "react";
import { FormColumns } from "../FormColumns";
import { DL_ReadOnlyText } from "./DL_ReadOnlyText";
import { DL_TextField } from "./DL_TextField";
import { NodeFormColumns } from "./NodeFormColumns";
import { ScoringTable } from "./ScoringTable";
import { StyledRadioGroup } from "./StyledRadios";

// dev note: we do some type optional-swapping to support CustomFormField prop guarantees
export const DecisionLogicWrapper = (props: Partial<DecisionLogicContextProps>) => {
  const reqProps = props as Required<DecisionLogicContextProps>;
  const { formField, isEditing, getValue, onValueChanged } = reqProps;

  const decisionLogicContext = useDecisionLogicContextController({
    formField,
    isEditing,
    getValue,
    onValueChanged,
  });

  return (
    <DecisionLogicContext.Provider value={decisionLogicContext}>
      <Main />
    </DecisionLogicContext.Provider>
  );
};

const Main = () => {
  const { isEditing, decisionLogic, dispatch } = useDecisionLogicContext();

  const handleActionTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as DecisionLogicAxis;
    dispatch({
      type: "change-actionType",
      axis: value,
    });
  };

  const handleOutcomeTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as DecisionLogicAxis;
    dispatch({
      type: "change-outcomeType",
      axis: value,
    });
  };

  const handleChangeAction = (id: string, value: string) => {
    if (decisionLogic.actions) {
      dispatch({
        type: "edit-action",
        action: {
          id,
          value,
        },
      });
    }
  };

  const handleChangeOutcome = (id: string, value: string) => {
    if (decisionLogic.outcomes) {
      dispatch({
        type: "edit-outcome",
        outcome: {
          id,
          value,
        },
      });
    }
  };

  const handleAddAction = () => dispatch({ type: "new-action" });
  const handleAddOutcome = () => dispatch({ type: "new-outcome" });

  return (
    <Stack>
      {/* <FormControl> */}
      <Typography variant="h2" sx={{ mb: 2 }}>
        Action
      </Typography>
      <FormColumns
        label="Action type"
        inputElement={
          <StyledRadioGroup
            handleOnChange={handleActionTypeChange}
            defaultValue={decisionLogic.actionType}
            inputs={[
              {
                title: "Discrete",
                description: "Decide which action to perform",
              },
              {
                title: "Numeric",
                description: "Decide which value to use when performing the action",
              },
            ]}
          />
        }
        description={[
          "Discrete example: Whether to reach out to a given customer",
          "Numerical example: What rate to offer when reaching out",
        ]}
      />
      <NodeFormColumns
        axis={decisionLogic.actionType}
        noun="actions"
        nodes={decisionLogic.actions}
        handleChange={handleChangeAction}
        handleAdd={handleAddAction}
      />

      <Typography variant="h2" sx={{ mt: 2, mb: 2 }}>
        Outcome
      </Typography>
      <FormColumns
        label="Outcome type"
        inputElement={
          <StyledRadioGroup
            handleOnChange={handleOutcomeTypeChange}
            defaultValue={decisionLogic.outcomeType}
            inputs={[
              {
                title: "Discrete",
                description: "Each outcome either happens or doesn't happen",
              },
              {
                title: "Numeric",
                description: "The outcome happens to a quantifiable extent",
              },
            ]}
          />
        }
        description={[
          "Discrete example: Customer churns or doesn't churn",
          "Numerical example: Customer generates some amount of revenue",
        ]}
      />
      <NodeFormColumns
        axis={decisionLogic.outcomeType}
        noun="outcomes"
        nodes={decisionLogic.outcomes}
        handleChange={handleChangeOutcome}
        handleAdd={handleAddOutcome}
      />

      <ScoringTable />

      <FormColumns
        sx={{ mt: 2 }}
        label="What limits are there on taking the action?"
        inputElement={
          isEditing ? (
            <DL_TextField
              value={decisionLogic.actionDecisionMethod}
              onChange={(e) =>
                dispatch({ type: "edit-actionDecisionMethod", value: e.target.value })
              }
              multiline
              minRows={2}
            />
          ) : (
            <DL_ReadOnlyText value={decisionLogic.actionDecisionMethod} />
          )
        }
        description={"e.g. Budget, Personnel, Risk Tolerance"}
      />

      <FormColumns
        sx={{ mt: 2 }}
        label="Method for deciding which action to take"
        inputElement={
          <StyledRadioGroup
            handleOnChange={(e) => dispatch({ type: "edit-limits", value: e.target.value })}
            defaultValue={decisionLogic.limits}
            longDescription
            inputs={[
              {
                title: "Score threshold",
                description:
                  "Recommend the action for all instances where the score is in a particular range",
              },
              {
                title: "Finite number of action-instances",
                description:
                  "Recommend the action for the subset of instances with the highest scores",
              },
            ]}
          />
        }
      />
      <FormColumns
        sx={{ mt: 2 }}
        label="Describe the logic for determining an action for a particular instance"
        inputElement={
          isEditing ? (
            <DL_TextField
              value={decisionLogic.instanceLogic}
              onChange={(e) => dispatch({ type: "edit-instanceLogic", value: e.target.value })}
              multiline
              minRows={2}
            />
          ) : (
            <DL_ReadOnlyText value={decisionLogic.instanceLogic} />
          )
        }
      />
      {/* </FormControl> */}
    </Stack>
  );
};
