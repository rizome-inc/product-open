import { Prisma, User } from "@prisma/client";

export const BaseUserRefSelectArgs: Prisma.UserSelect = {
  email: true,
  firstName: true,
  id: true,
  lastName: true,
  status: true,
  roles: true,
  supabaseId: true,
  uuid: true,
  avatar: true,
  collaborationColor: true,
};

// fixme: having this be partial is confusing given how widespread its usage is
export type UserRef = Partial<
  Pick<User, "email" | "firstName" | "id" | "lastName" | "status" | "roles" | "supabaseId">
>;
