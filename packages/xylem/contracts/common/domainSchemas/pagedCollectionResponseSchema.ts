import { z } from "zod";
import { discussionCommentSchema } from "../../discussion";

// fixme: I don't think this includes files. Will need to handle file return stuff in router too
export const pagedCollectionResponseSchema = z.object({
  values: z.array(discussionCommentSchema),
  pageToken: z.string().optional().nullable(),
});

export type PagedCollectionResponseSchema = z.infer<typeof pagedCollectionResponseSchema>;
