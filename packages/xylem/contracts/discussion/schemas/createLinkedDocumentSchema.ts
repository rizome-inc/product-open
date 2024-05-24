import { z } from "zod";

export const createLinkedDocumentSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  locationName: z.string().min(1).optional().nullable(),
});

export type CreateLinkedDocumentSchema = z.infer<typeof createLinkedDocumentSchema>;
