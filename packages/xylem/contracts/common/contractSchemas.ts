import { z } from "zod";

export const errorSchema = z.object({
  message: z.string(),
});

export type ErrorSchema = z.infer<typeof errorSchema>;