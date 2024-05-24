import { z } from "zod";

export const allFormFieldTypes = [
  "array",
  "boolean",
  "date",
  "date-range",
  "file",
  "image",
  "multi-select",
  "select",
  "short-text",
  "tags",
  "text",
  "decision-logic",
  // "Email",
] as const;

export type FormFieldType = typeof allFormFieldTypes[number];

const formFieldDateRangeSchema = z.object({
  start: z.union([z.date(), z.string()]).optional().nullable(),
  end: z.union([z.date(), z.string()]).optional().nullable(),
});

export type FormFieldDateRangeSchema = z.infer<typeof formFieldDateRangeSchema>;

const formFieldOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export type FormFieldOptionSchema = z.infer<typeof formFieldOptionSchema>;

const formFieldSelectPropertiesSchema = z.object({
  options: z.array(formFieldOptionSchema).min(1),
});

type FormFieldSelectPropertiesSchema = z.infer<typeof formFieldSelectPropertiesSchema>;

/**
 * Note on file/image types:
 * value saved to db: `{ id (file attachment): string, path: string, fileName: string }`
 * value returned to client: `fileAttachmentSchema` with `downloadUrl` defined
 * todo: more explicitly define the file attachment value type
 */

export const formFieldBaseSchema = z.object({
  id: z.string().optional().nullable(),
  label: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(allFormFieldTypes),
  required: z.boolean().optional(), // todo: is this ever used?
  hidden: z.boolean().optional().nullable(), // todo: is this ever used?
  placeholder: z.string().optional().nullable(), // todo: is this ever used?
  // todo: better typing for value enums (just `any` right now)
  // should involve parsing based on the `type`
  value: z.any().optional(),
    // .object({
    //   // type: z.string(),
    //   value: z.any(),
    // }).optional(),
  maxLength: z.number().int().min(1).optional(),
});

export type FormFieldSchema = z.infer<typeof formFieldBaseSchema>;

export const formFieldSelectSchema = formFieldBaseSchema.extend({
  // subtype: z.literal("short-text"), // todo: connect to form field types better
  properties: formFieldSelectPropertiesSchema,
});

export type FormFieldSelectSchema = z.infer<typeof formFieldSelectSchema>;

export const formFieldArraySchema = formFieldBaseSchema.extend({
  subtype: z.literal("short-text"), // todo: connect to form field types better
});

export type FormFieldArraySchema = z.infer<typeof formFieldArraySchema>;

// In-order validation https://zod.dev/?id=unions
export const formFieldSchemaUnion = z.union([formFieldArraySchema, formFieldSelectSchema, formFieldBaseSchema]);

export type FormFieldSchemaUnion = z.infer<typeof formFieldSchemaUnion>;