import { baseApiModelSchema } from "../../common/domainSchemas/baseApiModelSchema";
import { z } from "zod";

export const discussionLinkedDocumentSchema = baseApiModelSchema.extend({
  url: z.string().url(),
  name: z.string().min(1),
  locationName: z.string().min(1).optional().nullable(),
});

export type DiscussionLinkedDocumentSchema = z.infer<typeof discussionLinkedDocumentSchema>;
