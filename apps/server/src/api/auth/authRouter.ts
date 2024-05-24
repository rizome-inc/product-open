import { db } from "@/common/db";
import { Prisma, UserRole } from "@prisma/client";
import { EmailNotificationFrequency } from "@/api/user/types/notificationFrequency";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { RizomeAccessToken, RizomeRefreshToken, authContract } from "xylem";
import { RecursiveRouterObj } from "@ts-rest/express/src/lib/types";
import createUserClient, { createAdminClient } from "@/lib/supabase";
import { MailService } from "@/lib/mail/mailService";
import { liveblocksClient } from "@/lib/liveblocks";
import { createFlow } from "../project/projectService";
import { isType } from "@/lib/util/typeGuards";

// https://supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow-for-ssr?framework=express

/**
 * todo: make an error class with an integrated logger
 *
 */
const authRouter: RecursiveRouterObj<typeof authContract> = {
  /**
   * todo: move this into summary of the contract? where should the source of truth be?
   *
   * Creates organization, user, and project templates for the new org
   * Sends magic link email to user
   *
   * This is a public path
   */
  signup: async ({ req, res }) => {
    const { email, organizationName, firstName, lastName } = req.body;
    const supabase = createUserClient({ req, res });

    try {
      // context.user is expected to be null. If the user exists, we return a 500 later
      const user = await db.user.findFirst({
        where: {
          email,
        },
        include: {
          organization: true,
        },
      });

      if (user) {
        // TODO: don't know if we should expose the fact that the email exists in the system
        return {
          status: 500,
          body: {
            message: "User already exists.",
          },
        };
      }

      const orgExists = await db.organization.findUnique({
        where: {
          name: organizationName,
        },
      });

      if (orgExists) {
        // TODO: don't know if we should expose the fact that the email exists in the system
        return {
          status: 500,
          body: {
            message: "Organization already exists.",
          },
        };
      }

      const createdUser = await db.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: organizationName,
          },
        });

        if (!organization) throw new Error("Failed to create organization");

        const user = await tx.user.create({
          data: {
            email: email,
            firstName,
            lastName,
            organization: {
              connect: {
                id: organization.id,
              },
            },
            roles: [UserRole.SuperAdmin],
            preferences: {
              create: {
                emailNotifications: {
                  projects: {
                    addedAsContributor: true,
                    reviewRequested: true,
                  },
                  discussions: {
                    addedAsParticipant: true,
                    mentionedInComment: true,
                  },
                  frequency: EmailNotificationFrequency.All,
                },
              },
            },
          },
          include: {
            organization: true,
          },
        });

        if (!user) throw new Error("Failed to create user");

        /*const defaultTemplates = await tx.defaultProjectTemplate.findMany();
        await tx.projectTemplate.createMany({
          data: defaultTemplates.map((t) => {
            const { active, content, contentVersion, description, example, name } = t;
            return {
              active,
              content: content ?? Prisma.JsonNull,
              contentVersion,
              description,
              example,
              name,
              organizationId: organization.id,
              creatorId: user.id,
            };
          }),
        });*/
        return user;
      });

      //create demo project
      await createFlow(createdUser, {
        name: "Example Project",
        businessUnit: "—",
        example: true,
      });

      const supabaseAdminClient = createAdminClient();
      const { data, error } = await supabaseAdminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      if (error) {
        console.error(error);
        return {
          status: 500,
          body: {
            message: "Failed to sign up new user",
          },
        };
      } else {
        // fixme: add error handling
        const mailService = new MailService(createdUser);
        await mailService.sendSignup(email, {
          token_hash: data.properties?.hashed_token,
        });
        return {
          status: 201,
          body: {},
        };
      }
    } catch (e: unknown) {
      console.error("Error:", e);
      return {
        status: 500,
        body: {
          message: "An error occurred. Please try again",
        },
      };
    }
  },
  /**
   * Links the Supabase id to the email in our database if not already linked
   * Runs after a successful client-side OTP confirmation
   *
   * This is a public path (see context middleware for exclusion from standard context)
   */
  confirm: async ({ req, headers, res }) => {
    const next = req.query.next ?? "/";

    const supabase = createUserClient({ req, res });

    const refreshToken = headers[RizomeRefreshToken]
      ? (headers[RizomeRefreshToken] as string)
      : undefined;
    const accessToken = headers[RizomeAccessToken]
      ? (headers[RizomeAccessToken] as string)
      : undefined;

    // console.log(`refresh: ${refreshToken} \n access: ${accessToken}`);

    if (refreshToken && accessToken) {
      const { data, error } = await supabase.auth.setSession({
        refresh_token: refreshToken,
        access_token: accessToken,
      });
      if (error || !data.user) {
        console.error("User confirmation error or no session data returned", error);
        return {
          status: 303,
          body: {
            url: "/signin",
            message: "Failed to authenticate user",
          },
        };
      }
      const { email, id: supabaseId } = data.user;
      try {
        // Prisma calls shenanigans on updating with null values, so do a lookup first
        const unlinkedUser = await db.user.findFirst({
          select: {
            id: true,
          },
          where: {
            email,
            supabaseId: null,
          },
        });
        if (unlinkedUser) {
          console.log("Linking user to supabase");
          await db.user.update({
            where: {
              id: unlinkedUser.id,
            },
            data: {
              supabaseId,
            },
          });
        }
        return {
          status: 302,
          body: {
            url: `/${next.slice(1)}`,
          },
        };
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === "P2025") {
            console.warn("User already linked to Supabase");
            return {
              status: 302,
              body: {
                url: "/projects",
                message: "User already linked",
              },
            };
          } else {
            console.error(e.code, e.message);
            return {
              status: 303,
              body: {
                url: "/signin",
                message: "Failed to authenticate user",
              },
            };
          }
        }
      }
    }
    // Dev note: default return because compiler isn't smart enough to recognized that an if-else is exhaustive
    return {
      status: 303,
      body: {
        url: "/signin",
        message: "Unauthorized",
      },
    };
  },
  liveblocks: async ({ req, res }) => {
    const { user } = req.context;

    // Pick a random color from our color scheme for the user's avatar
    const colorList = ["AB25E3", "1AA499", "EC9018", "3B24E8", "EF1351"];
    const colorNumber = Math.floor(Math.random() * (colorList.length - 1));
    const avatarColor = colorList[colorNumber];

    try {
      // Start an auth session inside your endpoint
      const session = liveblocksClient.prepareSession(user.uuid, {
        userInfo: {
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
          avatar:
            user.avatar ??
            `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=${avatarColor}&color=fff&rounded=true`,
          color: `#${user.collaborationColor ?? avatarColor}`,
        },
      });

      // Implement your own security, and give the user access to the room
      if (req.body.room) {
        // && __shouldUserHaveAccess__(user, req.body.room)) {
        session.allow(req.body.room, session.FULL_ACCESS);
      } else {
        // Authorize readonly for all rooms this user belongs to. This is called for inbox notifications.
        // fixme: full access is granted for now due to liveblocks errors on FE
        session.allow(`org_${user.organizationId}:*`, session.FULL_ACCESS);
        // const projects = await db.contributor.findMany({
        //   where: {
        //     userId: user.id,
        //   },
        //   select: {
        //     project: {
        //       select: {
        //         roomId: true
        //       }
        //     }
        //   }
        // });
        // const roomIds = projects.map(p => p.project.roomId).filter(isType<string>);
        // console.log(roomIds)
        // roomIds.forEach(id => session.allow(id, session.FULL_ACCESS))
      }

      // Authorize the user and return the result
      const { status, body, error } = await session.authorize();
      console.log(status, body, error);
      const { token } = JSON.parse(body) as { token: string };
      if (error) {
        throw error;
      }
      return {
        status: 200,
        body: {
          token,
        },
      };
    } catch (e) {
      const message = "Error authenticating with liveblocks";
      console.error(message, e);
      return {
        status: 500,
        body: {
          message,
        },
      };
    }
  },
};

export default authRouter;
