import { z } from "zod";

export const createDiscussionSchema = z.object({
  projectId: z.number().min(1),
  name: z.string().min(1),
  topic: z.string().optional().nullable(),
  participantIds: z.array(z.number()).optional(),
  files: z.array(z.string()).max(1).optional().nullable(),
});

export type CreateDiscussionSchema = z.infer<typeof createDiscussionSchema>;
