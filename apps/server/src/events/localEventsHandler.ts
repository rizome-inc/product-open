import { ContributorRole, NotificationType, UserPreference } from "@prisma/client";
import { OperationContextUser } from "@/common/types";
import { getEntityDisplayName } from "@/common/utils";
import { ProjectEventType } from "@/api/project/events/projectEventType";
import { EmailNotificationFrequency } from "@/api/user/types/notificationFrequency";
import { UserEventType } from "@/api/user/events/userEventType";
import { ProjectPublishedEvent } from "@/api/project/events/publishedEvent";
import { db } from "@/common/db";
import { ProjectContributorsAddedEvent } from "@/api/project/events/contributorsAddedEvent";
import { UserInvitedEvent } from "@/api/user/events/userInvitedEvent";
import {
  defaultUserEmailNotificationPreferences,
  userEmailNotificationPreferencesSchema,
} from "xylem";
import { userBelongsToOrgGuard } from "@/lib/user";
import { createAdminClient } from "@/lib/supabase";
import { EventEmitter2 } from "eventemitter2";
import { MailService } from "@/lib/mail/mailService";

// fixme: the majority of this handler code is copy-paste

/**
 * Docs
 * https://github.com/EventEmitter2/EventEmitter2
 *
 * We define the event emitter in the listener file to ensure all listeners are attached before
 * any events are emitted.
 *
 * Default settings are updated based on config in app.module.ts
 * I set `ignoreErrors` to false for testing; tbd if we should keep it
 */
export const eventEmitter = new EventEmitter2({
  // set this to `true` to use wildcards
  wildcard: true,

  // the delimiter used to segment namespaces
  delimiter: ".",

  // set this to `true` if you want to emit the newListener event
  newListener: false,

  // set this to `true` if you want to emit the removeListener event
  removeListener: false,

  // the maximum amount of listeners that can be assigned to an event
  maxListeners: 10,

  // show event name in memory leak message when more than maximum amount of listeners is assigned
  verboseMemoryLeak: false,

  // disable throwing uncaughtException if an error event is emitted and it has no listeners
  ignoreErrors: false,
});

type ProjectRef = {
  id: number;
  name: string;
  publishedAt: Date | string | null;
};

type ContributorRef = {
  userId?: number;
  role: ContributorRole;
  user?: { email: string; id: number; preferences?: UserPreference };
};

const _canSendEmailForNotificationType = (
  notificationType: NotificationType,
  userPreferences?: UserPreference,
) => {
  const emailNotificationPreferences = userPreferences?.emailNotifications
    ? userEmailNotificationPreferencesSchema.parse(userPreferences?.emailNotifications) // todo: verify this works
    : defaultUserEmailNotificationPreferences;

  if (emailNotificationPreferences?.frequency !== EmailNotificationFrequency.All) {
    return false;
  }

  switch (notificationType) {
    case NotificationType.AddedAsDiscussionParticipant: {
      return emailNotificationPreferences.discussions.addedAsParticipant;
    }
    case NotificationType.DiscussionCommentMention: {
      return emailNotificationPreferences.discussions.mentionedInComment;
    }
    case NotificationType.AddedAsProjectContributor: {
      return emailNotificationPreferences.projects.addedAsContributor;
    }
    case NotificationType.ProjectReviewRequested: {
      return emailNotificationPreferences.projects.reviewRequested;
    }
    default: {
      return true;
    }
  }
};

const _notifyProjectApproversReviewRequested = async (
  contextUser: OperationContextUser,
  project: ProjectRef,
  approvers: ContributorRef[],
) => {
  try {
    const supabaseAdminClient = createAdminClient();
    // fetch user prefs if needed
    const approversWithoutPreferences = approvers.filter((x) => !x.user?.preferences);
    if (approversWithoutPreferences.length) {
      const userIdArray: number[] = approversWithoutPreferences
        .map((x) => x.userId || x.user?.id)
        .filter((x) => x !== undefined)
        .map((x) => x!);
      const preferencesMap = (
        await db.userPreference.findMany({
          where: {
            userId: {
              in: userIdArray,
            },
          },
        })
      ).reduce<Record<number, UserPreference>>((res, curr) => {
        res[curr.userId] = curr;
        return res;
      }, {});
      approvers.forEach((approver) => {
        if (approver.userId || approver.user?.id) {
          const prefs = preferencesMap[(approver.userId || approver.user?.id)!]; // fixme: this typing needs to be stricter
          if (prefs && approver.user) {
            approver.user.preferences = prefs;
          }
        }
      });
    }

    // handle notifications, remote events and emails
    approvers.forEach(async ({ user }) => {
      try {
        if (!user) {
          throw new Error("user not defined");
        }

        if (
          !_canSendEmailForNotificationType(
            NotificationType.ProjectReviewRequested,
            user?.preferences,
          )
        ) {
          return;
        }

        const dbUser = await db.user.findFirstOrThrow({
          where: {
            email: user.email,
            id: user.id,
          },
        });

        const { data, error } = await supabaseAdminClient.auth.admin.generateLink({
          type: "magiclink",
          email: user.email,
        });
        if (error) {
          throw new Error(`Failed to generate magic link to request review from ${user.email}`);
        }
        const mailService = new MailService(dbUser);

        await mailService.sendProjectApprovalRequest(user.email, {
          projectName: project.name,
          path: `/projects/${project.id}`,
          token_hash: data.properties?.hashed_token,
        });
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error(err);
  }
};

/**
 * Note: project.contributors.user.preferences expected
 */
eventEmitter.on(ProjectEventType.Published, async ({ user, project }: ProjectPublishedEvent) => {
  const approvers = project.contributors?.filter((x) => x.role === ContributorRole.Approver);
  if (approvers && approvers?.length > 0) {
    await _notifyProjectApproversReviewRequested(
      user,
      project as ProjectRef,
      approvers as ContributorRef[],
    );
  }
});

eventEmitter.on(
  ProjectEventType.ContributorAdded,
  async ({ user: contextUser, projectId, contributors }: ProjectContributorsAddedEvent) => {
    console.log("i'm setting contrib", contributors);
    try {
      const supabaseAdminClient = createAdminClient();
      const organization = userBelongsToOrgGuard(contextUser);
      const project = await db.project.findFirst({
        where: {
          id: projectId,
          organizationId: organization.id,
        },
        select: {
          id: true,
          name: true,
          publishedAt: true,
        },
      });

      if (!project) {
        return;
      }

      // if not published, don't send to approvers
      const validContributorIds = (
        !project.publishedAt
          ? contributors.filter((x) => x.role !== ContributorRole.Approver)
          : contributors
      ).map((x) => x.userId);

      if (validContributorIds.length === 0) {
        return;
      }

      const users = await db.user.findMany({
        where: {
          id: {
            in: validContributorIds,
          },
          organizationId: contextUser.organizationId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          supabaseId: true,
          preferences: true,
        },
      });

      users.forEach(async ({ email, id, preferences, firstName, lastName, supabaseId }) => {
        if (
          !_canSendEmailForNotificationType(
            NotificationType.AddedAsProjectContributor,
            preferences ?? undefined,
          )
        ) {
          return;
        }

        try {
          const { data, error } = await supabaseAdminClient.auth.admin.generateLink({
            type: "magiclink",
            email,
          });
          if (error) {
            throw new Error(`Failed to generate magic link to add ${email} as contributor`);
          }
          const mailService = new MailService({ firstName, lastName, email, supabaseId });
          // todo: await this?
          mailService.sendProjectContributorAdded(email, {
            projectName: project.name,
            path: `/projects/${projectId}`,
            token_hash: data.properties?.hashed_token,
          });
        } catch (err) {
          console.error(err);
        }
      });

      // fixme: this logic is weird
      if (project.publishedAt) {
        const approvers = contributors.filter((x) => x.role === ContributorRole.Approver);
        approvers.forEach((x: ContributorRef) => {
          const user = users.find((user) => user.id === x.userId);
          if (user) {
            x.user = {
              ...user,
              preferences: user.preferences ?? undefined,
            };
          }
        });
        if (approvers.length > 0) {
          await _notifyProjectApproversReviewRequested(
            contextUser,
            project,
            approvers as ContributorRef[],
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
);

eventEmitter.on(
  UserEventType.Invited,
  async ({ user: contextUser, users }: UserInvitedEvent) => {
    try {
      const supabaseAdminClient = createAdminClient();
      const organization = userBelongsToOrgGuard(contextUser);
      const fromName = getEntityDisplayName(contextUser);
      (Array.isArray(users) ? users : [users])?.forEach(async (user) => {
        if (!user?.email) {
          throw new Error("Can't invite user if email not defined");
        }
        const { data, error } = await supabaseAdminClient.auth.admin.generateLink({
          type: "magiclink",
          email: user.email,
        });
        if (error) {
          throw new Error(`Failed to generate magic link to invite ${user.email}`);
        }
        // fixme: UserRef being a partial makes this annoying
        const mailService = new MailService({
          firstName: user.firstName ? user.firstName : null,
          lastName: user.lastName ? user.lastName : null,
          email: user.email,
          supabaseId: user.supabaseId ? user.supabaseId : null,
        });
        return await mailService.sendUserInvite(user.email, {
          fromName,
          organizationName: organization.name,
          path: `/projects`,
          token_hash: data.properties?.hashed_token,
        });
      });
    } catch (error) {
      console.error(error);
    }
  },
  { promisify: true },
);

console.log("Event listeners attached");
