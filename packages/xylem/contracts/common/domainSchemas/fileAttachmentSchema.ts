import { z } from "zod";

export const fileAttachmentSchema = z.object({
  id: z.string(),
  path: z.string(),
  fileName: z.string(),
  projectId: z.number().optional(),
  discussionId: z.number().optional(),
  discussionCommentId: z.number().optional(),
  downloadUrl: z.string().url().optional(),
  uploadUrl: z.string().url().optional(),
  uploadAuthToken: z.string().optional(),
});

export type FileAttachmentSchema = z.infer<typeof fileAttachmentSchema>;

export const attachedFilesResponseSchema = z.object({
  attachments: z.array(fileAttachmentSchema),
  partialFailure: z.boolean().optional()
});

export type AttachedFilesResponseSchema = z.infer<typeof attachedFilesResponseSchema>;