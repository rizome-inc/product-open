import { User } from "@prisma/client";
import { UserRole, UserSchema, UserStatus } from "xylem";

// todo: determine if there's a good consistent way to handle nested serde
export const userToXylem = (user: User): UserSchema => {
  return {
    ...user,
    roles: user.roles?.map((r) => r as UserRole),
    status: user.status as UserStatus,
  };
};
