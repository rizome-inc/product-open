import RizomeError, { ErrorName } from "@/common/rizomeError";
import { OperationContextUser } from "@/common/types";
import { Organization, UserRole } from "@prisma/client";

export const isAdmin = (roles: UserRole[]) =>
  roles.some((x) => x === UserRole.Admin || x === UserRole.SuperAdmin);

export const userBelongsToOrgGuard = (user: OperationContextUser): Organization => {
  if (!user.organization) {
    throw new RizomeError(ErrorName.BadRequest, `User ${user.id} doesn't belong to organization`);
  } else {
    return user.organization;
  }
};
