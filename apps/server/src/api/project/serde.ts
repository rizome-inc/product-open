import { OperationContextUser, ProjectWithRelationships } from "@/common/types";
import {
  ContributorRole,
  ContributorSchema,
  FlowProjectSchema,
  ProjectApprovalResponse,
  ProjectSchema,
  ProjectStatus,
  RecordedProjectApprovalResponseSchema,
  UserRole,
  UserStatus,
  projectContentSchema,
} from "xylem";
import { userToXylem } from "../user/serde";
import { ContributorWithRelationships } from "./types";
import { discussionToXylem } from "../discussion/serde";
import { ProjectApproval } from "@prisma/client";

export const contributorToXylem = (data: ContributorWithRelationships): ContributorSchema => {
  const { id, email, firstName, lastName, roles, status } = data.user;
  return {
    ...data,
    role: data.role as ContributorRole,
    user: {
      id,
      email,
      firstName,
      lastName,
      roles: roles?.map((r) => r as UserRole),
      status: status as UserStatus,
    },
  };
};

export const projectToXylem = (data: ProjectWithRelationships): ProjectSchema => {
  return {
    ...data,
    example: data.example || false,
    businessUnit: data.bussinessUnit,
    content: projectContentSchema.parse(data.content),
    publishedAt: data.publishedAt ? data.publishedAt : undefined,
    status: data.status as ProjectStatus,
    contributors: data.contributors?.map(contributorToXylem),
    discussions: data.discussions?.map(discussionToXylem),
  };
};

export const flowProjectToXylem = (data: ProjectWithRelationships): FlowProjectSchema => {
  return {
    ...data,
    example: data.example || false,
    businessUnit: data.bussinessUnit,
    publishedAt: data.publishedAt ? data.publishedAt : undefined,
    status: data.status as ProjectStatus,
    contributors: data.contributors?.map(contributorToXylem),
  };
};

// fixme: is 'participant' the same as 'contributor'? Seems like it can be? get clarity
export const projectApprovalToXylem = (
  data: ProjectApproval & {
    participantIds?: { id: number }[];
    // creator?: OperationContextUser
  },
): RecordedProjectApprovalResponseSchema => {
  return {
    ...data,
    participantIds: data.participantIds?.map((x) => x.id) ?? [],
    response: data.response as ProjectApprovalResponse,
    discussionId: data.discussionId ?? undefined, // fixme: clean up contract
    // creator: data.creator ? userToXylem(data.creator) : undefined
  };
};
