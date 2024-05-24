import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { errorSchema } from "../common/contractSchemas";
import { addFeedbackSchema } from "./schema";

const c = initContract();

export const feedbackContract = c.router({
  giveFeedback: {
    method: "POST",
    path: "/",
    body: addFeedbackSchema,
    responses: {
      201: z.string().optional(),
      400: errorSchema,
      500: errorSchema
    }
  }
}, {
  pathPrefix: "/feedback"
});