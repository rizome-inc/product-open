import { UserPreference, User } from "@prisma/client";

export * from "./userRefs";

export type UsersWithRelationships = User & {
  preferences?: UserPreference;
};
