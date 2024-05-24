import { z } from "zod";

export const supportSchema = z.object({
  help: z.string(),
});

export type SupportSchema = z.infer<typeof supportSchema>;