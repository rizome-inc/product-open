import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { errorSchema } from "../common/contractSchemas";
import { templateSchema } from "./schema";

const c = initContract();

export const templateContract = c.router({
  create: {
    method: "POST",
    path: "/",
    body: templateSchema,
    responses: {
      201: templateSchema,
      400: errorSchema,
      403: errorSchema,
      500: errorSchema
    }
  },
  update: {
    method: "PUT",
    path: "/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    body: templateSchema,
    responses: {
      200: templateSchema,
      400: errorSchema,
      403: errorSchema,
      500: errorSchema
    }
  },
  getAll: {
    method: "GET",
    path: "/",
    responses: {
      200: z.array(templateSchema),
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
      200: templateSchema,
      400: errorSchema,
      404: errorSchema,
      500: errorSchema
    }
  },
}, {
  pathPrefix: "/templates"
});