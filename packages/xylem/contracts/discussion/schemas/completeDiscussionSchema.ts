import { z } from "zod";

export const completeDiscussionSchema = z.object({
  outcome: z.string().min(1),
});

export type CompleteDiscussionSchema = z.infer<typeof completeDiscussionSchema>;
