import { projectContract, ContributorRole as XylemContributorRole } from "xylem";
import {
  addApprovalResponse,
  attachFile,
  createFlow,
  createFromTemplateAsync,
  getAllActiveProjects,
  getAllContributorsByProjectIdAsync,
  getAllDiscussionsByProjectIdAsync,
  getApprovalHistoryAsync,
  getApprovalsAsync,
  getFlowProjectById,
  getProjectById,
  publishAsync,
  renameAsync,
  setContributorsAsync,
  updateFlowProject,
  updateProject,
} from "./projectService";
import { Project } from "@prisma/client";
import { RecursiveRouterObj } from "@ts-rest/express/src/lib/types";
import { toSchema } from "../user/userService";
import { discussionToXylem } from "../discussion/serde";
import { flowProjectToXylem, projectApprovalToXylem, projectToXylem } from "./serde";
import { generateImage } from "@/lib/openaiClient";
import { userBelongsToOrgGuard } from "@/lib/user";
import {
  generateSignedAttachmentUrl,
  SIGNED_URL_EXPIRES_IN,
  uploadProjectImageFromBase64,
} from "@/lib/storage";
import dayjs from "dayjs";

const projectRouter: RecursiveRouterObj<typeof projectContract> = {
  getAll: async ({ req }) => {
    try {
      const { user } = req.context;

      const projects = await getAllActiveProjects(user);
      return {
        status: 200,
        body: projects.map((p) => {
          return {
            id: p.id,
            name: p.name,
            businessUnit: p.bussinessUnit,
            updatedAt: p.updatedAt,
            roomId: p.roomId,
          };
        }),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  get: async ({ req }) => {
    const { user } = req.context;
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return {
        status: 400,
        body: {
          message: "id is not defined",
        },
      };
    }
    const { includeContent, includeContributors, includeDiscussions } = req.query;

    // construct variable includes object for db query. todo: make this less hardcoded
    const includesObject = {
      discussions: includeDiscussions,
      contributors: includeContributors,
      content: includeContent,
    };

    try {
      const project = await getProjectById(user, id, includesObject);
      return {
        status: 200,
        body: project,
      };
    } catch (e) {
      console.error(`User ${user.id} does not have access to project`, e);
      // todo: make better error handling for access vs 500
      return {
        status: 403,
        body: {
          message: "You do not have access to this project",
        },
      };
    }
  },
  getFlow: async ({ req }) => {
    const { user } = req.context;
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return {
        status: 400,
        body: {
          message: "id is not defined",
        },
      };
    }

    try {
      const project = await getFlowProjectById(user, id);
      return {
        status: 200,
        body: project,
      };
    } catch (e) {
      console.error(`User ${user.id} does not have access to project`, e);
      // todo: make better error handling for access vs 500
      return {
        status: 403,
        body: {
          message: "You do not have access to this project",
        },
      };
    }
  },
  getSignedUploadUrl: async ({ req }) => {
    try {
      const { user } = req.context;
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }
      const uploadSchema = await attachFile(user, id, req.body.fileName);
      return {
        status: 200,
        body: uploadSchema,
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  getSignedUrl: async ({ req }) => {
    try {
      const signedUrl = await generateSignedAttachmentUrl(req.body.path);
      return {
        status: 200,
        body: {
          signedUrl,
          signedUrlExpiration: dayjs().add(SIGNED_URL_EXPIRES_IN, "seconds").toDate(),
        },
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  updateContent: async ({ req }) => {
    try {
      const { user } = req.context;
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }

      const updateProjectRes = await updateProject(user, id, req.body);

      return {
        status: 200,
        body: {
          ...updateProjectRes,
        },
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  updateFlowContent: async ({ req }) => {
    try {
      const { user } = req.context;
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }

      const updateProjectRes = await updateFlowProject(user, id, req.body);

      return {
        status: 200,
        body: {
          ...updateProjectRes,
        },
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  contributors: async ({ req }) => {
    try {
      const { user } = req.context;

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }
      const contributors = await getAllContributorsByProjectIdAsync(user, id);
      return {
        status: 200,
        body: contributors.map((c) => {
          return {
            ...c,
            role: c.role as XylemContributorRole,
            user: toSchema(user),
          };
        }),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  setContributors: async ({ req }) => {
    try {
      const { user } = req.context;

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }
      const contributors = await setContributorsAsync(user, id, req.body);
      return {
        status: 200,
        body: contributors.map((c) => {
          return {
            ...c,
            role: c.role as XylemContributorRole,
            user: toSchema(c.user),
          };
        }),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  discussions: async ({ req }) => {
    try {
      const { user } = req.context;

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }
      const discussions = await getAllDiscussionsByProjectIdAsync(user, id);
      return {
        status: 200,
        body: discussions.map(discussionToXylem),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  create: async ({ req }) => {
    try {
      const { user } = req.context;

      const project: Project = await createFromTemplateAsync(user, req.body);
      return {
        status: 201,
        body: projectToXylem(project),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  createFlow: async ({ req }) => {
    try {
      const { user } = req.context;

      const project: Project = await createFlow(user, req.body);
      return {
        status: 201,
        body: flowProjectToXylem(project),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  rename: async ({ req }) => {
    try {
      const { user } = req.context;
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }

      const project: Project = await renameAsync(user, id, req.body);
      return {
        status: 200,
        body: flowProjectToXylem(project),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  publish: async ({ req }) => {
    try {
      const { user } = req.context;

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }

      const project = await publishAsync(user, id);
      return {
        status: 200,
        body: projectToXylem(project),
      };
    } catch (e) {
      console.error(e);
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  approvals: async ({ req }) => {
    try {
      const { user } = req.context;

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }
      const approvals = await getApprovalsAsync(user, id);
      return {
        status: 200,
        body: approvals.map(projectApprovalToXylem),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  approvalHistory: async ({ req }) => {
    try {
      const { user } = req.context;

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }
      const approvalHistory = await getApprovalHistoryAsync(user, id);
      return {
        status: 200,
        body: approvalHistory.map(projectApprovalToXylem),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  approve: async ({ req }) => {
    try {
      const { user } = req.context;

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }
      const approval = await addApprovalResponse(user, id, req.body);
      return {
        status: 200,
        body: projectApprovalToXylem(approval),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },

  generateImage: async ({ req }) => {
    try {
      const organization = userBelongsToOrgGuard(req.context.user);
      const { prompt, projectId } = req.body;
      const base64 = await generateImage(prompt);
      if (!base64) {
        throw new Error("Dall-e response undefined");
      }
      const supabasePath = await uploadProjectImageFromBase64({
        projectId,
        organizationId: organization.id,
        fileBase64: base64,
      });
      const signedUrl = await generateSignedAttachmentUrl(supabasePath);

      return {
        status: 200,
        body: {
          path: supabasePath,
          signedUrl,
          signedUrlExpiration: dayjs().add(SIGNED_URL_EXPIRES_IN, "seconds").toDate(),
        },
      };
    } catch (e) {
      console.error("Dall-e image generation error", e);
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
};

export default projectRouter;
