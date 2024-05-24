import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { confirmationQuery, signupSchema } from "./schema";
import { errorSchema } from "../common/contractSchemas";

const c = initContract();

export const authContract = c.router({
  signup: {
    method: "POST",
    path: "/signup",
    body: signupSchema,
    responses: {
      201: z.object({}),
      500: errorSchema
    }
  },
  confirm: {
    method: "POST",
    path: "/confirm",
    query: confirmationQuery,
    body: z.object({}),
    responses: {
      302: z.object({
        url: z.string(),
        message: z.string().optional()
      }),
      303: z.object({
        url: z.string(),
        message: z.string()
      }),
      500: errorSchema
    }
  },
  liveblocks: {
    method: "POST",
    path: "/liveblocks",
    body: z.object({
      room: z.string().optional(),
    }),
    responses: {
      200: z.object({
        token: z.string(),
      }),
      400: errorSchema,
      500: errorSchema
    }
  }
}, {
  pathPrefix: "/auth"
});