import { z } from "zod";
import { createLinkedDocumentSchema } from "./createLinkedDocumentSchema";

export const updateLinkedDocumentSchema = createLinkedDocumentSchema.partial();

export type UpdateLinkedDocumentSchema = z.infer<typeof updateLinkedDocumentSchema>;
