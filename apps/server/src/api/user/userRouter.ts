import { userContract, userPreferencesSchema } from "xylem";
import {
  createAsync,
  deactivateAsync,
  getAllAsync,
  getByIdAsync,
  getUserPreferenceAsync,
  inviteUsersAsync,
  setUserPreferenceAsync,
  updateAsync,
} from "./userService";
import { isAdmin } from "@/lib/user";
import { RecursiveRouterObj } from "@ts-rest/express/src/lib/types";
import { userToXylem } from "./serde";

const userRouter: RecursiveRouterObj<typeof userContract> = {
  getAllUsersInMyOrg: async ({ req }) => {
    try {
      const users = await getAllAsync(req.context.user, req.query);
      return {
        status: 200,
        body: users.map(userToXylem),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  getCurrentUser: async ({ req }) => {
    try {
      const user = await getByIdAsync(req.context.user, req.context.user.id, {
        organization: true,
        preferences: true,
      });
      return {
        status: 200,
        body: userToXylem(user),
      };
    } catch (e) {
      console.error(e);
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  preferences: async ({ req }) => {
    try {
      const preferences = await getUserPreferenceAsync(req.context.user, req.context.user.id);
      return {
        status: 200,
        body: userPreferencesSchema.parse(preferences),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  updatePreferences: async ({ req }) => {
    try {
      const preferences = await setUserPreferenceAsync(
        req.context.user,
        req.context.user.id,
        req.body,
      );
      return {
        status: 200,
        body: userPreferencesSchema.parse(preferences), // todo: verify this works
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  get: async ({ req }) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }
      const user = await getByIdAsync(req.context.user, id, {
        organization: true,
      });
      return {
        status: 200,
        body: userToXylem(user),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  create: async ({ req }) => {
    const { user: contextUser } = req.context;
    if (!isAdmin(contextUser.roles)) {
      return {
        status: 403,
        body: {
          message: "User must be admin to create users",
        },
      };
    }
    try {
      const user = await createAsync(contextUser, req.body);
      return {
        status: 201,
        body: userToXylem(user),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  invite: async ({ req }) => {
    try {
      const users = await inviteUsersAsync(req.context.user, req.body);
      return {
        status: 200,
        body: users.map(userToXylem),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  update: async ({ req }) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "id is not defined",
          },
        };
      }
      const user = await updateAsync(req.context.user, id, req.body);
      return {
        status: 200,
        body: userToXylem(user),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
  delete: async ({ req }) => {
    const { user: contextUser } = req.context;
    if (!isAdmin(contextUser.roles)) {
      return {
        status: 403,
        body: {
          message: "User must be admin to delete users",
        },
      };
    }
    try {
      const user = await deactivateAsync(contextUser, req.body.id);
      return {
        status: 200,
        body: userToXylem(user),
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "An error occurred",
        },
      };
    }
  },
};

export default userRouter;
