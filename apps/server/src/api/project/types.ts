import { ContributorRole, Contributor, Prisma, User } from "@prisma/client";
import { BaseUserRefSelectArgs, UserRef } from "@/api/user/types";

export const AllContributorRoles = Object.values(ContributorRole);

export type ContributorWithRelationships = Contributor & {
  user: User;
};

export const DefaultContributorsSelectArgs: Prisma.ContributorSelect = {
  id: true,
  role: true,
  user: {
    select: BaseUserRefSelectArgs,
  },
};
