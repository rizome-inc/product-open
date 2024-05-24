import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { errorSchema } from "../common/contractSchemas";
import { supportSchema } from "./schema";

const c = initContract();

export const supportContract = c.router({
  request: {
    method: "POST",
    path: "/request",
    body: supportSchema,
    responses: {
      201: z.string().optional(),
      400: errorSchema,
      500: errorSchema
    }
  }
}, {
  pathPrefix: "/support"
});