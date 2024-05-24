import { z } from "zod";

// fixme: this feels like a verbose way to handle pagination

export const pageTokenSchema = z.object({
  cursor: z.number().int().min(0),
  pageSize: z.number().int().min(0),
});

export type PageTokenSchema = z.infer<typeof pageTokenSchema>;

export const paginationSchema = z.object({
  pageToken: z
    .string()
    .transform((value) => JSON.parse(value))
    .optional()
    .nullable(),
  cursor: z.number().int().min(0),
  pageSize: z.number().int().min(0).default(25),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;
