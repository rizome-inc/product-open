import { z } from "zod";
import { formFieldSchemaUnion } from "./formFieldSchema";

export const projectContentCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(formFieldSchemaUnion).min(1),
});

export type ProjectContentCategorySchema = z.infer<typeof projectContentCategorySchema>;

export const projectContentSchema = z.object({
  categories: z.array(projectContentCategorySchema), // todo: in the DTO this was nonempty but I'm not sure it needs to be that strict
});

export type ProjectContentSchema = z.infer<
  typeof projectContentSchema
>;

export const workTrackingSchema = z.object({
  workTrackingUrl: z.string().optional().nullable(),
  workTrackingName: z.string().optional().nullable(),
});

export type WorkTrackingSchema = z.infer<typeof workTrackingSchema>;

/**
 * todo: what should be the max number of attachments per project?
 */
export const updateProjectContentSchema = workTrackingSchema.extend({
  content: projectContentSchema,
});

export type UpdateProjectContentSchema = z.infer<typeof updateProjectContentSchema>;
