import { z } from "zod";

export const addFeedbackSchema = z.object({
  reason: z.string().min(1),
  difficulty: z.string().min(1),
  preference: z.string().optional().nullable(),
  suggestion: z.string().optional().nullable(),
});

export type AddFeedbackSchema = z.infer<typeof addFeedbackSchema>;