import { baseApiModelSchema } from "../../common/domainSchemas/baseApiModelSchema";
import { createLinkedDocumentSchema } from "./createLinkedDocumentSchema";
import { z } from "zod";
import { userSchema } from "../../user/schemas/userSchema";
import { discussionCommentSchema } from "./discussionCommentSchema";
import { fileAttachmentSchema } from "../../common";

export const discussionLinkedDocumentsSchema = baseApiModelSchema
  .merge(createLinkedDocumentSchema)
  .extend({
    discussionId: z.number().optional().nullable(),
  });

export type DiscussionLinkedDocumentsSchema = z.infer<typeof discussionLinkedDocumentsSchema>;

export const discussionSchema = baseApiModelSchema.extend({
  completedAt: z.union([z.date(), z.string().datetime()]).optional().nullable(),
  projectId: z.number(),
  name: z.string().min(1),
  topic: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
  creator: userSchema.optional(),
  participants: z.array(userSchema).optional(),
  linkedDocuments: z.array(discussionLinkedDocumentsSchema).optional().nullable(),
  fileAttachments: z.array(fileAttachmentSchema).optional().nullable(),
  comments: z.array(discussionCommentSchema).optional()
});

export type DiscussionSchema = z.infer<typeof discussionSchema>;
