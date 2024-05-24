import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { errorSchema } from "../common/contractSchemas";
import { completeDiscussionSchema, createDiscussionSchema, createLinkedDocumentSchema, discussionLinkedDocumentsSchema, discussionSchema, discussionCommentSchema, setDiscussionParticipantsSchema, updateDiscussionSchema, updateLinkedDocumentSchema, discussionCommentContentSchema } from "./schemas";
import { userSchema } from "../user";
import { fileAttachmentSchema, pagedCollectionResponseSchema, paginationSchema } from "../common";

const c = initContract();

export const discussionContract = c.router({
  create: {
    method: "POST",
    path: "/",
    body: createDiscussionSchema,
    responses: {
      201: discussionSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  // todo: can probably use this same endpoint for comment file deletion too
  deleteAttachment: {
    method: "DELETE",
    path: "/:discussionId/attachments/:attachmentId",
    pathParams: z.object({
      discussionId: z.string(),
      attachmentId: z.string(),
    }),
    // todo: determine a better way to handle ts-rest's requirement of deletion bodies yet path params being relevant
    body: z.object({
      discussionId: z.string(),
      attachmentId: z.string(),
    }),
    responses: {
      200: z.string().optional(),
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
    responses: {
      200: discussionSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  getParticipants: {
    method: "GET",
    path: "/:id/participants",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(userSchema),
      400: errorSchema,
      500: errorSchema
    }
  },
  setParticipants: {
    method: "PUT",
    path: "/:id/participants",
    pathParams: z.object({
      id: z.string(),
    }),
    body: setDiscussionParticipantsSchema,
    responses: {
      200: z.array(userSchema),
      400: errorSchema,
      500: errorSchema
    }
  },
  update: {
    method: "PATCH",
    path: "/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    body: updateDiscussionSchema,
    responses: {
      200: discussionSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  // todo: this is a link. why does it need a whole CRUD api?
  linkDocument: {
    method: "POST",
    path: "/:id/linkeddocument",
    pathParams: z.object({
      id: z.string(),
    }),
    body: createLinkedDocumentSchema,
    responses: {
      201: createLinkedDocumentSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  deleteLinkedDocument: {
    method: "DELETE",
    path: "/:discussionId/linkeddocument/:documentId",
    pathParams: z.object({
      discussionId: z.string().transform(Number),
      documentId: z.string().transform(Number),
    }),
    body: z.object({
      discussionId: z.number(),
      documentId: z.number(),
    }),
    responses: {
      200: z.string().optional(),
      400: errorSchema,
      500: errorSchema
    }
  },
  updateLinkedDocument: {
    method: "PATCH",
    path: "/:discussionId/linkeddocument/:documentId",
    pathParams: z.object({
      discussionId: z.string().transform(Number),
      documentId: z.string().transform(Number),
    }),
    body: updateLinkedDocumentSchema,
    responses: {
      200: discussionLinkedDocumentsSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  comments: {
    method: "GET",
    path: "/:id/comments",
    pathParams: z.object({
      id: z.string(),
    }),
    // query: paginationSchema,
    responses: {
      200: pagedCollectionResponseSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  comment: {
    method: "POST",
    path: "/:id/comments",
    pathParams: z.object({
      id: z.string(),
    }),
    body: discussionCommentContentSchema,
    responses: {
      201: discussionCommentSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  complete: {
    method: "POST",
    path: "/:id/complete",
    pathParams: z.object({
      id: z.string(),
    }),
    body: completeDiscussionSchema,
    responses: {
      200: discussionSchema,
      400: errorSchema,
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
  // getSignedUploadUrlForComment: {
  //   method: "POST",
  //   path: "/:discussionId/comment/:commentId/signedUpload",
  //   pathParams: z.object({
  //     discussionId: z.string(),
  //     commentId: z.string(),
  //   }),
  //   body: z.object({
  //     fileName: z.string().min(1),
  //   }),
  //   responses: {
  //     200: fileAttachmentSchema,
  //     400: errorSchema,
  //     500: errorSchema
  //   }
  // },
}, {
  pathPrefix: "/discussion"
});