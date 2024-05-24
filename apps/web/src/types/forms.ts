import { SxProps } from "@mui/material";
import { FormFieldSchemaUnion } from "xylem";
import { z } from "zod";

export enum DecisionLogicAxis {
  Discrete = "Discrete",
  Numeric = "Numeric",
}

export const DecisionLogicAxes = Object.values(DecisionLogicAxis);

export const costOrBenefitSchema = z.object({
  id: z.string().trim(),
  name: z.string().trim(),
  type: z.enum(["Cost", "Benefit"]).default("Cost"),
  calculationManner: z.string().trim(),
  logicDescription: z.string().trim(),
});

export type CostOrBenefit = z.infer<typeof costOrBenefitSchema>;

export const scoringDetailSchema = z.object({
  probability: z.string().trim(),
  costsAndBenefits: z.array(costOrBenefitSchema),
});

export type ScoringDetail = z.infer<typeof scoringDetailSchema>;

export const decisionLogicNodeSchema = z.object({
  id: z.string().trim(),
  value: z.string().trim(),
});

export type DecisionLogicNode = z.infer<typeof decisionLogicNodeSchema>;

export const decisionLogicScoreNodeSchema = z.object({
  id: z.string().trim(),
  detail: scoringDetailSchema.optional(),
  actionId: z.string().trim().optional(),
  outcomeId: z.string().trim().optional(),
});

export type DecisionLogicScoreNode = z.infer<typeof decisionLogicScoreNodeSchema>;

// Decision Logic schema with sensible defaults
export const decisionLogicSchema = z.object({
  actionType: z.nativeEnum(DecisionLogicAxis).default(DecisionLogicAxis.Discrete),
  outcomeType: z.nativeEnum(DecisionLogicAxis).default(DecisionLogicAxis.Discrete),
  actions: z.array(decisionLogicNodeSchema).default([]),
  outcomes: z.array(decisionLogicNodeSchema).default([]),
  scores: z.array(decisionLogicScoreNodeSchema).default([]),
  numericScore: z.array(costOrBenefitSchema).default([]),
  limits: z.string().trim().default("Score threshold"),
  actionDecisionMethod: z.string().trim().default(""),
  instanceLogic: z.string().trim().default(""),
});

export type DecisionLogic = z.infer<typeof decisionLogicSchema>;

export type CustomFormFieldProps<TValue = any | null | undefined, TTransformedValue = TValue> = {
  formField: Omit<FormFieldSchemaUnion, "value"> & { value?: TTransformedValue };
  getValue: () => TTransformedValue | null | undefined;
  hideLabel?: boolean;
  isEditing?: boolean;
  onTransformOutputValue?: (value: TValue) => TTransformedValue;
  onValueChanged: (value: TTransformedValue | null | undefined) => void;
  sx?: SxProps;
};
