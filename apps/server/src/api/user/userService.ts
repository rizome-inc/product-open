import { UserPreference, UserStatus, User, UserRole } from "@prisma/client";
import { UserEventType } from "./events/userEventType";
import { BaseUserRefSelectArgs } from "./types";
import { OperationContextUser } from "@/common/types";
import { db } from "@/common/db";
import {
  CreateUserSchema,
  InviteUsersSchema,
  UpdateUserSchema,
  UserIncludeParamsSchema,
  UserEmailNotificationPreferencesSchema,
  UpdateUserPreferencesSchema,
  UserSchema,
  UserRole as XylemUserRole,
  UserStatus as XylemUserStatus,
} from "xylem";
import { isAdmin, userBelongsToOrgGuard } from "@/lib/user";
import RizomeError, { ErrorName } from "@/common/rizomeError";
import { UserDeactivatedEvent } from "./events/userDeactivatedEvent";
import { UserInvitedEvent } from "./events/userInvitedEvent";
import { eventEmitter } from "@/events/localEventsHandler";

export const toSchema = (user: User): UserSchema => {
  return {
    ...user,
    roles: user.roles.map((r) => r as XylemUserRole),
    status: user.status ? (user.status as XylemUserStatus) : undefined,
  };
};

export const createAsync = async (
  contextUser: OperationContextUser,
  createUserDto: CreateUserSchema,
) => {
  const organization = userBelongsToOrgGuard(contextUser);
  const user = await db.user.create({
    data: {
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      organization: {
        connect: {
          id: organization.id,
        },
      },
    },
  });

  return user;
};

export const getAllAsync = async (
  contextUser: OperationContextUser,
  payload?: UserIncludeParamsSchema,
) => {
  const users = await db.user.findMany({
    orderBy: [
      {
        firstName: "desc",
      },
      {
        lastName: "desc",
      },
      {
        email: "desc",
      },
    ],
    where: {
      organizationId: contextUser.organizationId,
      status: payload?.includeDeactivated ? undefined : UserStatus.Active,
    },
    select: BaseUserRefSelectArgs,
  });

  return users;
};

export const getByIdAsync = async (
  contextUser: OperationContextUser,
  id: number,
  include?: { organization?: boolean; preferences?: boolean },
  isSystem?: boolean, // fixme: determine a better way to establish system ops
) => {
  const user = await db.user.findFirstOrThrow({
    where: isSystem
      ? { id }
      : {
          id,
          organizationId: contextUser.organizationId,
        },
    include,
  });

  return user;
};

export const getAllByIdsAsync = async (
  contextUser: OperationContextUser,
  ids: number[],
  include?: { organization?: boolean },
  isSystem?: boolean,
) => {
  const users = await db.user.findMany({
    where: {
      id: {
        in: ids,
      },
      organizationId: isSystem ? undefined : contextUser.organizationId,
    },
    include,
  });

  return users;
};

export const findOneForOperationContextByid = async (id: number, organizationId: number) => {
  const user = await db.user.findFirstOrThrow({
    where: {
      id,
      organizationId,
    },
    include: {
      organization: true,
    },
  });

  return user;
};

export const updateAsync = async (
  contextUser: OperationContextUser,
  userIdToUpdate: number,
  payload: UpdateUserSchema,
) => {
  const { preferences, roles, status, ...rest } = payload;

  // todo: create a different API endpoint for status / role changes that only admins use
  if (!isAdmin(contextUser.roles) && (roles !== undefined || status !== undefined)) {
    console.error(`User ${contextUser.id} tried to update a user but is not authorized`);
    throw new RizomeError(ErrorName.Forbidden, "Only admins can update users");
  }

  // Create an initial avatar if user doesn't have one and name is added
  let newAvatar;
  let avatarColor;
  if (!contextUser.avatar && payload.firstName && payload.lastName) {
    // Pick a random color from our color scheme for the user's avatar
    const colorList = ["AB25E3", "1AA499", "EC9018", "3B24E8", "EF1351"];
    const colorNumber = Math.floor(Math.random() * (colorList.length - 1));
    avatarColor = colorList[colorNumber];
    newAvatar = `https://ui-avatars.com/api/?name=${payload.firstName}+${payload.lastName}&background=${avatarColor}&color=fff&rounded=true`;
  }

  const updatedUser = await db.user.update({
    where: {
      id: userIdToUpdate,
    },
    data: {
      ...rest,
      roles: roles?.map((r) => r as UserRole),
      status: status ? (status as UserStatus) : undefined,
      avatar: newAvatar,
      collaborationColor: avatarColor,
      preferences: preferences
        ? {
            update: {
              emailNotifications: preferences.emailNotifications,
            },
          }
        : undefined,
    },
  });

  return updatedUser;
};

export const getUserPreferenceAsync = async (contextUser: OperationContextUser, userId: number) => {
  const organization = userBelongsToOrgGuard(contextUser);
  const preferences = await db.userPreference.findFirstOrThrow({
    where: {
      userId: userId,
      user: {
        organizationId: organization.id,
      },
    },
  });

  return preferences;
};

export const setUserPreferenceAsync = async (
  contextUser: OperationContextUser,
  userId: number,
  payload: UpdateUserPreferencesSchema,
) => {
  const organization = userBelongsToOrgGuard(contextUser);
  let preferences: Partial<UserPreference> =
    (await _getUserPreferenceAsync(contextUser, userId)) || {};

  preferences = await db.userPreference.upsert({
    where: {
      userId: userId,
      user: {
        organizationId: organization.id,
      },
    },
    update: payload,
    create: {
      ...payload,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

  return preferences;
};

export const deactivateAsync = async (contextUser: OperationContextUser, id: number) => {
  await guardUserExistsForOrgAsync(contextUser, id);

  const user = await db.user.update({
    where: {
      id,
    },
    data: {
      status: UserStatus.Deactivated,
    },
    select: BaseUserRefSelectArgs,
  });

  eventEmitter.emitAsync(UserEventType.Deactivated, new UserDeactivatedEvent(contextUser, user));

  return user;
};

// zod error workaround will be resolved with strict checks: https://stackoverflow.com/questions/71185664/why-does-zod-make-all-my-schema-fields-optional
export const inviteUsersAsync = async (
  contextUser: OperationContextUser,
  payload: InviteUsersSchema,
) => {
  const organization = userBelongsToOrgGuard(contextUser);
  const usersWithRequiredEmails = payload.users!.map((u) => {
    return {
      ...u,
      email: u.email!,
    };
  });
  await db.$transaction([
    db.user.createMany({
      data: usersWithRequiredEmails.map((user) => ({
        ...user,
        roles: payload.roles.map((r) => r as UserRole),
        organizationId: organization.id,
      })),
      skipDuplicates: true,
    }),
  ]);

  const createdUsers = await db.user.findMany({
    where: {
      AND: [
        {
          organizationId: organization.id,
        },
        {
          email: {
            in: payload.users.map((x) => x.email),
          },
        },
      ],
    },
  });

  await eventEmitter.emitAsync(
    UserEventType.Invited,
    new UserInvitedEvent(contextUser, createdUsers),
  );

  return createdUsers;
};

const _getUserPreferenceAsync = (
  contextUser: OperationContextUser,
  userId: number,
  isSystem?: boolean,
) => {
  const organization = userBelongsToOrgGuard(contextUser);
  return db.userPreference.findFirst({
    where: {
      userId: userId,
      user: isSystem
        ? undefined
        : {
            organizationId: organization.id,
          },
    },
  });
};

const guardUserExistsForOrgAsync = async (contextUser: OperationContextUser, id: number) => {
  const count = await db.user.count({
    where: {
      id,
      organizationId: contextUser.organizationId,
    },
  });

  if (count !== 1) {
    throw new RizomeError(ErrorName.NotFound, `User with id: '${id}' not found.`);
  }
};
