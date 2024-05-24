import { PageTokenSchema, discussionContract } from "xylem";
import {
  attachFileToDiscussion,
  completeAsync,
  createAsync,
  createCommentAsync,
  createLinkedDocumentAsync,
  getAllParticipantsByDiscussionIdAsync,
  getCommentsByDiscussionIdAsync,
  getDiscussionByIdAsync,
  removeLinkedDocumentAsync,
  setParticipantsAsync,
  updateByIdAsync,
  updateLinkedDocumentAsync,
} from "./discussionService";
import { DiscussionWithRelationships } from "./types";
import { Discussion } from "@prisma/client";
import { RecursiveRouterObj } from "@ts-rest/express/src/lib/types";
import { toSchema } from "../user/userService";
import { userToXylem } from "../user/serde";
import { discussionCommentToXylem, discussionToXylem } from "./serde";
import { deleteFileAttachment } from "@/lib/storage";

// fixme: typing on /create and /complete sucks - tie it together better
const discussionsRouter: RecursiveRouterObj<typeof discussionContract> = {
  create: async ({ req }) => {
    try {
      const { user } = req.context;

      const discussion = await createAsync(user, req.body);
      return {
        status: 201,
        body: discussionToXylem({
          ...discussion,
          comments: undefined,
          projectApproval: discussion.projectApproval ?? undefined,
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

      const discussion = await getDiscussionByIdAsync(user, id);
      return {
        status: 200,
        body: discussion,
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
  getParticipants: async ({ req }) => {
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
      const participants = await getAllParticipantsByDiscussionIdAsync(user, id);
      return {
        status: 200,
        body: participants.map(toSchema),
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
  setParticipants: async ({ req }) => {
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
      const participants = await setParticipantsAsync(user, id, req.body);
      return {
        status: 200,
        body: participants.map(userToXylem),
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
  update: async ({ req }) => {
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

      const discussion: Discussion = await updateByIdAsync(user, id, req.body);
      return {
        status: 200,
        body: discussionToXylem(discussion),
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
  linkDocument: async ({ req }) => {
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

      const linkedDoc = await createLinkedDocumentAsync(user, id, req.body);
      return {
        status: 201,
        body: linkedDoc,
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
  deleteLinkedDocument: async ({ req }) => {
    try {
      const { user } = req.context;

      const { documentId, discussionId } = req.params;
      await removeLinkedDocumentAsync(user, discussionId, documentId);
      return {
        status: 200,
        body: "Document deleted",
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
  updateLinkedDocument: async ({ req }) => {
    try {
      const { user } = req.context;

      const { documentId, discussionId } = req.params;

      const linkedDoc = await updateLinkedDocumentAsync(user, documentId, discussionId, req.body);
      return {
        status: 200,
        body: linkedDoc,
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
  comments: async ({ req }) => {
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
      const { comments } = await getCommentsByDiscussionIdAsync(user, id);

      return {
        status: 200,
        body: {
          values: comments.map(discussionCommentToXylem),
          // pageToken: JSON.stringify(nextPageToken),
        },
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  comment: async ({ req }) => {
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

      const commentRes = await createCommentAsync(user, id, req.body);

      return {
        status: 201,
        body: {
          ...discussionCommentToXylem(commentRes),
        },
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  complete: async ({ req }) => {
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

      const discussion = await completeAsync(user, id, req.body);
      return {
        status: 200,
        body: discussionToXylem({
          ...discussion,
          comments: undefined,
          projectApproval: discussion.projectApproval ?? undefined,
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
  // fixme: should file upload limits be on server or client? I'd prefer client validation
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

      const uploadSchema = await attachFileToDiscussion(user, id, req.body.fileName);
      return {
        status: 200,
        body: uploadSchema,
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
  // fixme: there isn't much control on this endpoint
  deleteAttachment: async ({ req }) => {
    try {
      const { user } = req.context;

      const { attachmentId } = req.params;
      await deleteFileAttachment(attachmentId);
      return {
        status: 200,
        body: "Attachment deleted",
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
};

export default discussionsRouter;
