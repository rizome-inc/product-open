import { UserStatus } from "@prisma/client";
import moment from "moment";
import { ScheduledTaskNames } from "@/common/constants";
import { EmailNotificationFrequency } from "@/api/user/types/notificationFrequency";
import cron from "node-cron";
import { db } from "@/common/db";
import { createAdminClient } from "@/lib/supabase";
import { MailService } from "@/lib/mail/mailService";

const _sendAggregateNotificationEmailAsync = async (user: { email: string }, count: number) => {
  try {
    const dbUser = await db.user.findFirstOrThrow({
      where: {
        email: user.email,
      },
    });
    const supabaseAdminClient = createAdminClient();
    const { data, error } = await supabaseAdminClient.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
    });
    if (error) {
      throw new Error(
        `Failed to generate magic link to send aggregate notifications for ${user.email}`,
      );
    }
    const mailService = new MailService(dbUser);
    await mailService.sendAggregateNotificationEmailAsync(user.email, {
      count,
      path: `/inbox`,
      token_hash: data.properties?.hashed_token,
    });
  } catch (error) {
    console.error(error);
  }
};

// daily, Mon-Fri, 6:00am
cron.schedule(
  "0 06 * * 1-5",
  async () => {
    try {
      const yesterdayMoment = moment().subtract(24, "hours");
      const results = (
        await db.userPreference.findMany({
          where: {
            emailNotifications: {
              path: ["frequency"],
              equals: EmailNotificationFrequency.Daily,
            },
            user: {
              status: UserStatus.Active,
            },
          },
          select: {
            user: {
              select: {
                email: true,
                _count: {
                  select: {
                    nofications: {
                      where: {
                        AND: [
                          {
                            readAt: null,
                          },
                          {
                            createdAt: {
                              gte: yesterdayMoment.toDate(),
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        })
      ).filter((x) => x.user._count.nofications > 0);

      if (results?.length) {
        results.forEach(async ({ user }) => {
          try {
            await _sendAggregateNotificationEmailAsync(user, user._count.nofications);
          } catch (error) {
            console.error(error);
          }
        });
      }
      console.error(results);
    } catch (error) {
      console.error(error);
    }
  },
  {
    name: ScheduledTaskNames.DailyEmailNotifications,
    scheduled: true,
    timezone: "America/New_York",
  },
);

// every Monday, 6:05am
cron.schedule(
  "5 06 * * 1",
  async () => {
    try {
      const lastWeekMoment = moment().subtract(7, "days");
      const results = (
        await db.userPreference.findMany({
          where: {
            emailNotifications: {
              path: ["frequency"],
              equals: EmailNotificationFrequency.Weekly,
            },
            user: {
              status: UserStatus.Active,
            },
          },
          select: {
            user: {
              select: {
                email: true,
                _count: {
                  select: {
                    nofications: {
                      where: {
                        AND: [
                          {
                            readAt: null,
                          },
                          {
                            createdAt: {
                              gte: lastWeekMoment.toDate(),
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        })
      ).filter((x) => x.user._count.nofications > 0);

      if (results?.length) {
        results.forEach(async ({ user }) => {
          try {
            await _sendAggregateNotificationEmailAsync(user, user._count.nofications);
          } catch (error) {
            console.error(error);
          }
        });
      }
      console.error(results);
    } catch (error) {
      console.error(error);
    }
  },
  {
    name: ScheduledTaskNames.WeeklyEmailNotifications,
    scheduled: true,
    timezone: "America/New_York",
  },
);
