import { z } from "zod";

export const baseApiModelSchema = z.object({
  id: z.number().optional().nullable(),
  createdAt: z.union([z.date(), z.string()]).optional().nullable(),
  updatedAt: z.union([z.date(), z.string()]).optional().nullable(),
  creatorId: z.union([z.string(), z.number()]).optional().nullable(),
});

export type BaseApiModelSchema = z.infer<typeof baseApiModelSchema>;
