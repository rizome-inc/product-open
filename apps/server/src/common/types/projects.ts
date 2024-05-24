import { ProjectApprovalResponse, ProjectStatus, Project } from "@prisma/client";
import { ContributorWithRelationships } from "@/api/project/types";
import { DiscussionWithRelationships } from "@/api/discussion/types";

export const AllProjectStatuses = Object.values(ProjectStatus);

export const AppProjectApprovalResponses = Object.values(ProjectApprovalResponse);

export type ProjectWithRelationships = Project & {
  contributors?: ContributorWithRelationships[];
  discussions?: DiscussionWithRelationships[];
};
