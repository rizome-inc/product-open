import { baseApiModelSchema } from "../../common/domainSchemas/baseApiModelSchema";
import { z } from "zod";
import { EmailNotificationFrequency } from "../../common/enums";

export const projectEmailNotificationPreferencesSchema = z.object({
  addedAsContributor: z.boolean(),
  reviewRequested: z.boolean(),
});

export type ProjectEmailNotificationPreferencesSchema = z.infer<
  typeof projectEmailNotificationPreferencesSchema
>;

export const dicussionEmailNotificationPreferencesSchema = z.object({
  addedAsParticipant: z.boolean(),
  mentionedInComment: z.boolean(),
});

export type DicussionEmailNotificationPreferencesSchema = z.infer<
  typeof dicussionEmailNotificationPreferencesSchema
>;

export const updateUserEmailNotificationPreferencesSchema = z.object({
  projects: projectEmailNotificationPreferencesSchema,
  discussions: dicussionEmailNotificationPreferencesSchema,
  frequency: z.nativeEnum(EmailNotificationFrequency),
});

export type UpdateUserEmailNotificationPreferencesSchema = z.infer<
  typeof updateUserEmailNotificationPreferencesSchema
>;

export const userEmailNotificationPreferencesSchema = baseApiModelSchema.merge(
  updateUserEmailNotificationPreferencesSchema,
);

export type UserEmailNotificationPreferencesSchema = z.infer<
  typeof userEmailNotificationPreferencesSchema
>;

export const defaultUserEmailNotificationPreferences: UpdateUserEmailNotificationPreferencesSchema =
  {
    projects: {
      addedAsContributor: true,
      reviewRequested: true,
    },
    discussions: {
      addedAsParticipant: true,
      mentionedInComment: true,
    },
    frequency: EmailNotificationFrequency.All,
  };
