import { z } from "zod";
import {
  defaultUserEmailNotificationPreferences,
  userEmailNotificationPreferencesSchema,
} from "./userEmailNotificationPreferenceSchema";
import { baseApiModelSchema } from "../../common/domainSchemas/baseApiModelSchema";

export const updateUserPreferencesSchema = z.object({
  emailNotifications: userEmailNotificationPreferencesSchema.optional(),
});

export type UpdateUserPreferencesSchema = z.infer<typeof updateUserPreferencesSchema>;

export const userPreferencesSchema = baseApiModelSchema.merge(updateUserPreferencesSchema);

export type UserPreferencesSchema = z.infer<typeof userPreferencesSchema>;

export const defaultUserPreferences: UpdateUserPreferencesSchema = {
  emailNotifications: defaultUserEmailNotificationPreferences,
};
