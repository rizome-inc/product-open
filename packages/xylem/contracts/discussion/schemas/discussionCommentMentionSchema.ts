import { z } from "zod";

export const discussionCommentMentionSchema = z.object({
  userId: z.number(),
  token: z.string().min(1),
  replacementText: z.string().min(1),
});

export type DiscussionCommentMentionSchema = z.infer<typeof discussionCommentMentionSchema>;
