import { TemplateScope } from "../common/enums";
import { baseApiModelSchema } from "../common/domainSchemas/baseApiModelSchema";
import { z } from "zod";
import { projectContentSchema } from "../project/schemas";

export const templateSchema = baseApiModelSchema.extend({
  name: z.string().min(1),
  description: z.string().min(1),
  active: z.boolean().optional().nullable(),
  contentVersion: z.number().int().min(1),
  type: z.enum(["project"]), // single element union type at the moment. string literal unions are more easily modeled in zod with z.enum
  scope: z.nativeEnum(TemplateScope).optional(),
  content: projectContentSchema,
  example: z.string().optional().nullable(),
});

export type TemplateSchema = z.infer<typeof templateSchema>;
