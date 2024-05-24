import { baseApiModelSchema } from "../../common/domainSchemas/baseApiModelSchema";
import { UserRole, UserStatus } from "../../common/enums";
import { z } from "zod";
import { userPreferencesSchema } from "./userPreferencesSchema";

export const userIncludeParamsSchema = z.object({
  includeDeactivated: z.boolean().optional().nullable(),
});

export type UserIncludeParamsSchema = z.infer<typeof userIncludeParamsSchema>;

export const organizationSchema = baseApiModelSchema.extend({
  name: z.string().min(1),
});

export type OrganizationSchema = z.infer<typeof organizationSchema>;

export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).optional().nullable(),
  lastName: z.string().min(1).optional().nullable(),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

// todo: change this from being a partial so we get better typing
export const updateUserSchema = createUserSchema.partial().extend({
  preferences: userPreferencesSchema.optional(),
  roles: z.array(z.nativeEnum(UserRole)).min(1).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  supabaseId: z.string().nullable().optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

export const userSchema = baseApiModelSchema.merge(updateUserSchema).extend({
  uuid: z.string().min(1),
  organizationId: z.number().min(1).nullable(),
  organization: organizationSchema.optional().nullable(),
  avatar: z.string().optional().nullable(),
  collaborationColor: z.string().optional().nullable(),
});

export type UserSchema = z.infer<typeof userSchema>;

export const inviteUsersSchema = z.object({
  users: z.array(createUserSchema),
  roles: z.array(z.nativeEnum(UserRole)).min(1),
});

export type InviteUsersSchema = z.infer<typeof inviteUsersSchema>;
