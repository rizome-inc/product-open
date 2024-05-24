import { FileAttachment } from "@prisma/client";
import { FileAttachmentSchema } from "xylem";

export const fileAttachmentToXylem = (data: FileAttachment): FileAttachmentSchema => {
  return {
    ...data,
    id: data.uuid,
    fileName: data.name,
    projectId: data.projectId ?? undefined,
    discussionId: data.discussionId ?? undefined,
    discussionCommentId: data.discussionCommentId ?? undefined,
  };
};
