import {
  DiscussionCommentSchema,
  DiscussionSchema,
  FileAttachmentSchema,
  discussionCommentContentSchema,
} from "xylem";
import { userToXylem } from "../user/serde";
import { DiscussionCommentWithRelationships, DiscussionWithRelationships } from "./types";
import { fileAttachmentToXylem } from "@/common/serde";

export const discussionCommentToXylem = (
  comment: DiscussionCommentWithRelationships & { attachedFiles?: FileAttachmentSchema[] },
): DiscussionCommentSchema => {
  console.log(comment.content);
  return {
    ...comment,
    content: discussionCommentContentSchema.parse(comment.content),
    creator: userToXylem(comment.creator),
    attachedFiles: comment.attachedFiles,
  };
};

export const discussionToXylem = (data: DiscussionWithRelationships): DiscussionSchema => {
  return {
    ...data,
    creator: data.creator ? userToXylem(data.creator) : undefined,
    participants: data.participants?.map(userToXylem),
    comments: data.comments?.map(discussionCommentToXylem),
    fileAttachments: data.fileAttachments?.map(fileAttachmentToXylem),
  };
};
