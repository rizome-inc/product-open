/**
 * Common enumerated types for client and server.
 * Currently copied from Prisma-generated files.
 * todo = move away from DB as source of truth for enum generation
 */

export enum NotificationType {
  AddedAsDiscussionParticipant = 'AddedAsDiscussionParticipant',
  AddedAsProjectContributor = 'AddedAsProjectContributor',
  DiscussionCommentMention = 'DiscussionCommentMention',
  ProjectReviewRequested = 'ProjectReviewRequested'
};

export enum ContributorRole {
  Owner = 'Owner',
  Approver = 'Approver',
  Contributor = 'Contributor',
  ReadOnly = 'ReadOnly'
};

export enum ProjectApprovalResponse {
  Approved = 'Approved',
  Rejected = 'Rejected'
};

export enum ProjectStatus {
  Active = 'Active',
  Archived = 'Archived'
};

export enum TemplateScope {
  System = 'System',
  Organization = 'Organization',
  User = 'User'
};

export enum EmailNotificationFrequency {
  All = "All",
  Daily = "Daily",
  Weekly = "Weekly",
}

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  User = 'User'
};

export enum UserStatus {
  Active = 'Active',
  Deactivated = 'Deactivated'
}