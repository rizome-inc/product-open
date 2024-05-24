import { db } from "@/common/db";
import { templateContract, templateSchema } from "xylem";
import { isAdmin, userBelongsToOrgGuard } from "@/lib/user";
import { TemplateScope } from "@prisma/client";
import { RecursiveRouterObj } from "@ts-rest/express/src/lib/types";
import { isRizomeError } from "@/common/rizomeError";
import { templateToPrismaInput, templateToXylem } from "./serde";

const projectTemplateRouter: RecursiveRouterObj<typeof templateContract> = {
  create: async ({ req }) => {
    const { user } = req.context;

    if (!isAdmin(user.roles)) {
      return {
        status: 403,
        body: {
          message: "User must be admin to create templates",
        },
      };
    }
    try {
      const organization = userBelongsToOrgGuard(user);

      const projectTemplate = await db.projectTemplate.create({
        data: {
          ...templateToPrismaInput(req.body),
          creatorId: +user.id,
          organizationId: organization.id,
        },
      });

      return {
        status: 201,
        body: templateToXylem(projectTemplate),
      };
    } catch (e: unknown) {
      if (isRizomeError(e)) {
        return {
          status: e.errorName,
          body: {
            message: e.message,
          },
        };
      } else {
        return {
          status: 500,
          body: {
            message: "An error occurred",
          },
        };
      }
    }
  },
  update: async ({ req }) => {
    const { user } = req.context;
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return {
        status: 400,
        body: {
          message: "id is not defined",
        },
      };
    }

    if (!isAdmin(user.roles)) {
      return {
        status: 403,
        body: {
          message: "User must be admin to create templates",
        },
      };
    }
    const organization = userBelongsToOrgGuard(user);

    // Verify the current user has access to this organization
    try {
      const template = await db.projectTemplate.findFirstOrThrow({
        where: {
          id,
          organizationId: organization.id,
        },
        select: {
          id: true,
        },
      });
      const updatedTemplate = await db.projectTemplate.update({
        where: {
          id: template.id,
        },
        data: templateToPrismaInput(req.body),
      });

      return {
        status: 200,
        body: templateToXylem(updatedTemplate),
      };
    } catch (e) {
      console.error(`User ${user.id} does not have access to template`, e); // todo: other errors may happen too
      // todo: find the prisma error code that's thrown here and vary the response
      return {
        status: 403,
        body: {
          message: "You do not have access to this template",
        },
      };
    }
  },
  getAll: async ({ req }) => {
    const { user } = req.context;
    try {
      const organization = userBelongsToOrgGuard(user);

      // admins can see templates created by any of the users in their org
      const templates = await db.projectTemplate.findMany({
        where: {
          OR: [
            {
              scope: TemplateScope.System,
            },
            {
              organizationId: organization.id,
              scope: TemplateScope.Organization,
            },
            {
              organizationId: organization.id,
              creatorId: isAdmin(user.roles) ? undefined : user.id,
              scope: TemplateScope.User,
            },
          ],
        },
      });

      return {
        status: 200,
        body: templates.map((t) => templateToXylem(t)),
      };
    } catch (e: unknown) {
      if (isRizomeError(e)) {
        return {
          status: e.errorName,
          body: {
            message: e.message,
          },
        };
      } else {
        return {
          status: 500,
          body: {
            message: "An error occurred",
          },
        };
      }
    }
  },
  get: async ({ req }) => {
    const { user } = req.context;
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return {
        status: 400,
        body: {
          message: "id is not defined",
        },
      };
    }
    try {
      const organization = userBelongsToOrgGuard(user);
      // admins can see templates created by any of the users in their org
      const template = await db.projectTemplate.findFirstOrThrow({
        where: {
          OR: [
            {
              id,
              scope: TemplateScope.System,
            },
            {
              id,
              organizationId: organization.id,
              scope: TemplateScope.Organization,
            },
            {
              creatorId: isAdmin(user.roles) ? undefined : user.id,
              id,
              organizationId: organization.id,
              scope: TemplateScope.User,
            },
          ],
        },
      });
      return {
        status: 200,
        body: templateToXylem(template),
      };
    } catch (e: unknown) {
      // todo: find the prisma error code that's thrown here and vary the response
      console.error("Encountered an error getting a template", e);
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
};

export default projectTemplateRouter;
