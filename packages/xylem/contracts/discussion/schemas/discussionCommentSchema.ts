import { baseApiModelSchema } from "../../common/domainSchemas/baseApiModelSchema";
import { z } from "zod";
import { userSchema } from "../../user/schemas/userSchema";
import { attachedFilesResponseSchema, fileAttachmentSchema } from "../../common";
import { discussionCommentContentSchema } from "./discussionCommentContentSchema";

export const discussionCommentSchema = baseApiModelSchema.extend({
  content: discussionCommentContentSchema,
  creator: userSchema,
  discussionId: z.number(),
  attachedFiles: z.array(fileAttachmentSchema).optional()
});

export type DiscussionCommentSchema = z.infer<typeof discussionCommentSchema>;
