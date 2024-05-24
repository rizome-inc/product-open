import { z } from "zod";

export const updateDiscussionSchema = z.object({
  name: z.string().min(1).optional(),
  topic: z.string().optional(),
  outcome: z.string().optional(),
  completedAt: z.string().optional(), // todo: does this need to be a date string?
});

export type UpdateDiscussionSchema = z.infer<typeof updateDiscussionSchema>;
