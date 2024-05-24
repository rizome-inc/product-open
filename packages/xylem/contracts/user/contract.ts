import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { errorSchema } from "../common/contractSchemas";
import { createUserSchema, inviteUsersSchema, updateUserEmailNotificationPreferencesSchema, updateUserPreferencesSchema, updateUserSchema, userEmailNotificationPreferencesSchema, userIncludeParamsSchema, userPreferencesSchema, userSchema } from "./schemas";

const c = initContract();

export const userContract = c.router({
  getAllUsersInMyOrg: {
    method: "GET",
    path: "/",
    query: userIncludeParamsSchema,
    responses: {
      200: z.array(userSchema),
      400: errorSchema,
      500: errorSchema
    }
  },
  getCurrentUser: {
    method: "GET",
    path: "/me",
    responses: {
      200: userSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  preferences: {
    method: "GET",
    path: "/me/preferences",
    responses: {
      200: userPreferencesSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  updatePreferences: {
    method: "PUT",
    path: "/me/preferences",
    body: updateUserPreferencesSchema,
    responses: {
      200: userPreferencesSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  get: {
    method: "GET",
    path: "/me",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: userSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  create: {
    method: "POST",
    path: "/",
    body: createUserSchema,
    responses: {
      200: userSchema,
      400: errorSchema,
      403: errorSchema,
      500: errorSchema
    }
  },
  invite: {
    method: "POST",
    path: "/invite",
    body: inviteUsersSchema,
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
    body: updateUserSchema,
    responses: {
      200: userSchema,
      400: errorSchema,
      500: errorSchema
    }
  },
  delete: {
    method: "DELETE",
    path: "/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({
      id: z.number(),
    }),
    responses: {
      200: userSchema,
      400: errorSchema,
      403: errorSchema,
      500: errorSchema
    }
  },
}, {
  pathPrefix: "/user"
});