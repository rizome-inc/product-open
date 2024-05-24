import {
  DiscussionComment,
  DiscussionLinkedDocument,
  Discussion,
  Organization,
  ProjectApproval,
  Project,
  User,
  FileAttachment,
} from "@prisma/client";

export type DiscussionCommentWithRelationships = DiscussionComment & {
  creator: User;
  fileAttachments?: FileAttachment[];
};

// todo: why is this whole thing a partial? Don't we need info like creator?
export type DiscussionWithRelationships = Discussion & {
  comments?: DiscussionCommentWithRelationships[];
  creator?: User;
  fileAttachments?: FileAttachment[];
  linkedDocuments?: DiscussionLinkedDocument[];
  organization?: Organization; // why is this needed?
  participants?: User[];
  project?: Project; // why is this needed?
  projectApproval?: ProjectApproval; // why is this needed?
};
