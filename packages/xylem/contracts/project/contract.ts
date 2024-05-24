import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { errorSchema } from "../common/contractSchemas";
import { contributorSchema, createFlowProjectSchema, createProjectFromTemplateSchema, flowProjectSchema, projectApprovalResponseSchema, projectByIdQuerySchema, projectOverviewSchema, projectSchema, recordedProjectApprovalResponseSchema, renameProjectSchema, setContributorsSchema, updateProjectContentSchema, workTrackingSchema } from "./schemas";
import { discussionSchema } from "../discussion";
import { fileAttachmentSchema } from "../common";

const c = initContract();

export const projectContract = c.router({
  getAll: {
    method: "GET",
    path: "/",
    responses: {
      200: z.array(projectOverviewSchema),
      400: errorSchema,
      500: errorSchema
    }
  },
  get: {
    method: "GET",
    path: "/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    query: projectByIdQuerySchema,
    responses: {
      200: projectSchema,
      400: errorSchema,
      403: errorSchema,
      500: errorSchema
    }
  },
  getFlow: {
    method: "GET",
    path: "/flow/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: flowProjectSchema,
      400: errorSchema,
      403: errorSchema,
      500: errorSchema
    }
  },
  getSignedUploadUrl: {
    method: "POST",
    path: "/:id/signedUpload",
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({
      fileName: z.string().min(1),
    }),
    responses: {
      200: fileAttachmentSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  updateContent: {
    method: "PATCH",
    path: "/:id/content",
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateProjectContentSchema,
    responses: {
      200: projectSchema.extend({
        partialFailure: z.boolean()
      }),
      400: errorSchema,
      500: errorSchema
    }
  },
  updateFlowContent: {
    method: "PATCH",
    path: "/flow/:id/content",
    pathParams: z.object({
      id: z.string(),
    }),
    body: workTrackingSchema,
    responses: {
      200: flowProjectSchema.extend({
        partialFailure: z.boolean()
      }),
      400: errorSchema,
      500: errorSchema
    }
  },
  contributors: {
    method: "GET",
    path: "/:id/contributors",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(contributorSchema),
      400: errorSchema,
      500: errorSchema
    }
  },
  setContributors: {
    method: "PUT",
    path: "/:id/contributors",
    pathParams: z.object({
      id: z.string(),
    }),
    body: setContributorsSchema,
    responses: {
      200: z.array(contributorSchema),
      400: errorSchema,
      500: errorSchema
    }
  },
  discussions: {
    method: "GET",
    path: "/:id/discussions",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(discussionSchema),
      400: errorSchema,
      500: errorSchema
    }
  },
  create: {
    method: "POST",
    path: "/fromTemplate",
    body: createProjectFromTemplateSchema,
    responses: {
      201: projectSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  createFlow: {
    method: "POST",
    path: "/flow",
    body: createFlowProjectSchema,
    responses: {
      201: flowProjectSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  rename: {
    method: "PATCH",
    path: "/:id/name",
    pathParams: z.object({
      id: z.string(),
    }),
    body: renameProjectSchema,
    responses: {
      200: flowProjectSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  publish: {
    method: "POST",
    path: "/:id/publish",
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({}),
    responses: {
      200: projectSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  approvals: {
    method: "GET",
    path: "/:id/approvals",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(recordedProjectApprovalResponseSchema),
      400: errorSchema,
      500: errorSchema
    }
  },
  approvalHistory: {
    method: "GET",
    path: "/:id/approvalHistory",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(recordedProjectApprovalResponseSchema),
      400: errorSchema,
      500: errorSchema
    }
  },
  approve: {
    method: "POST",
    path: "/:id/approve",
    pathParams: z.object({
      id: z.string(),
    }),
    body: projectApprovalResponseSchema,
    responses: {
      200: projectApprovalResponseSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  generateImage: {
    method: "POST",
    path: "/dalle",
    /*pathParams: z.object({
      id: z.string(),
    }),*/
    body: z.object({
      prompt: z.string().min(1),
      projectId: z.number()
    }),
    responses: {
      200: z.object(
        {
          signedUrl: z.string().url(),
          path: z.string(),
          signedUrlExpiration: z.date(),
        }
      ),
      400: errorSchema,
      500: errorSchema
    }
  },
  getSignedUrl: {
    method: "POST",
    path: "/signed",
    body: z.object({
        path: z.string().min(1)
    }),
    responses: {
      200: z.object({
        signedUrl: z.string().url(),
        signedUrlExpiration: z.date(),
      }),
      400: errorSchema,
      500: errorSchema
    }
  }
})