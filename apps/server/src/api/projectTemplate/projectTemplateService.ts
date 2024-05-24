import { db } from "@/common/db";
import RizomeError, { ErrorName } from "@/common/rizomeError";
import { OperationContextUser } from "@/common/types";
import { isAdmin } from "@/lib/user";
import { TemplateScope } from "@prisma/client";

/**
 * admins can see user scoped templates
 * @param user
 * @param id
 * @returns
 */
export const getProjectTemplateById = (user: OperationContextUser, id: number) => {
  if (!user.organization?.id) {
    throw new RizomeError(ErrorName.BadRequest, "User does not belong to organization");
  }
  return db.projectTemplate.findFirstOrThrow({
    where: {
      OR: [
        {
          id,
          scope: TemplateScope.System,
        },
        {
          id,
          organizationId: user.organization.id,
          scope: TemplateScope.Organization,
        },
        {
          creatorId: isAdmin(user.roles) ? undefined : user.id,
          id,
          organizationId: user.organization.id,
          scope: TemplateScope.User,
        },
      ],
    },
  });
};
