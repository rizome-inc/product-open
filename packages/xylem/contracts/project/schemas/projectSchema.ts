import { ProjectApprovalResponse, ProjectStatus } from "../../common/enums";
import { z } from "zod";
import { baseApiModelSchema } from "../../common/domainSchemas/baseApiModelSchema";
import { contributorSchema, createContributorSchema } from "./contributorSchema";
import { projectContentSchema } from "./projectContentSchema";
import { discussionSchema } from "../../discussion/schemas/discussionSchema";

export const createProjectFromTemplateSchema = z.object({
  templateId: z.number(),
  name: z.string().min(1),
  businessUnit: z.string().min(1),
  example: z.boolean().optional()
});

export type CreateProjectFromTemplateSchema = z.infer<typeof createProjectFromTemplateSchema>;

export const createFlowProjectSchema = createProjectFromTemplateSchema.omit({
  templateId: true
});

export type CreateFlowProjectSchema = z.infer<typeof createFlowProjectSchema>;


export const projectApprovalResponseSchema = z.object({
  rejectionReason: z.string().optional().nullable(),
  // todo: I'm not sure why the conditional validation occurs in the DTO. skipping
  discussionName: z.string().min(1).optional(),
  participantIds: z.array(z.number()).default([]),
  response: z.nativeEnum(ProjectApprovalResponse),
});

export type ProjectApprovalResponseSchema = z.infer<typeof projectApprovalResponseSchema>;

export const recordedProjectApprovalResponseSchema = baseApiModelSchema
  .merge(projectApprovalResponseSchema)
  .extend({
    discussionId: z.number().optional().nullable(),
  });

export type RecordedProjectApprovalResponseSchema = z.infer<
  typeof recordedProjectApprovalResponseSchema
>;

export const projectByIdQuerySchema = z.object({
  includeDiscussions: z.boolean().default(false),
  includeContributors: z.boolean().default(false),
  includeContent: z.boolean().default(false),
});

export type ProjectByIdQuerySchema = z.infer<typeof projectByIdQuerySchema>;

export const renameProjectSchema = z.object({
  name: z.string().min(1),
});

export type RenameProjectSchema = z.infer<typeof renameProjectSchema>;

export const setContributorsSchema = z.object({
  contributors: z.array(createContributorSchema).min(1),
});

export type SetContributorsSchema = z.infer<typeof setContributorsSchema>;

export const projectSchema = baseApiModelSchema.extend({
  publishedAt: z.union([z.date(), z.string().datetime()]).optional(),
  name: z.string().min(1),
  businessUnit: z.string().optional().nullable(),
  templateId: z.number().optional().nullable(),
  organizationId: z.number().nullable(),
  status: z.nativeEnum(ProjectStatus).optional().nullable(),
  content: projectContentSchema,
  contributors: z.array(contributorSchema).optional().nullable(),
  discussions: z.array(discussionSchema).optional().nullable(),
  workTrackingUrl: z.string().optional().nullable(),
  workTrackingName: z.string().optional().nullable(),
  example: z.boolean().optional(),
  roomId: z.string().optional().nullable(),
});

export type ProjectSchema = z.infer<typeof projectSchema>;

export const projectOverviewSchema = projectSchema.pick({
  id: true,
  name: true,
  businessUnit: true,
  updatedAt: true,
  roomId: true
});

export type ProjectOverviewSchema = z.infer<typeof projectOverviewSchema>;

export const flowProjectSchema = projectSchema.omit({
  templateId: true,
  content: true,
  discussions: true
}).extend({
  roomId: z.string().nullable()
});

export type FlowProjectSchema = z.infer<typeof flowProjectSchema>;