import { db } from "@/common/db";
import { liveblocksClient } from "@/lib/liveblocks";
import { MailService } from "@/lib/mail/mailService";
import { LIVEBLOCKS_SECRET_KEY } from "@/lib/secrets";
import { createAdminClient } from "@/lib/supabase";
import { WebhookEvent, stringifyCommentBody } from "@liveblocks/node";
import { ContributorRole } from "@prisma/client";

export const syncProject = async (event: WebhookEvent) => {
  // When Storage document data has been updated
  if (event.type === "storageUpdated") {
    const { roomId } = event.data;

    // Get Storage data from Liveblocks REST API
    const url = `https://api.liveblocks.io/v2/rooms/${roomId}/storage`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${LIVEBLOCKS_SECRET_KEY}` },
    });

    if (!response.ok) {
      throw new Error("Problem accessing Liveblocks REST APIs");
    }

    // Your JSON Storage document data as a string
    const storageData = await response.text();

    const { id: projectId } = await db.project.findFirstOrThrow({
      where: {
        roomId,
      },
    });

    await db.project.update({
      where: {
        id: projectId,
      },
      data: {
        liveblocksContent: JSON.parse(storageData),
      },
    });
    console.info(`Updated storage data for room ${roomId}`);
  } else if (event.type === "commentCreated") {
    const { roomId, threadId, commentId } = event.data;

    // Get comment data and participants
    const [comment, { participantIds }] = await Promise.all([
      liveblocksClient.getComment({ roomId, threadId, commentId }),
      liveblocksClient.getThreadParticipants({ roomId, threadId }),
    ]);

    if (!comment.body) return;

    const htmlComment = await stringifyCommentBody(comment.body, {
      format: "html",

      async resolveUsers({ userIds }) {
        // Get the correct users from your database for tag resolution
        const users = await db.user.findMany({
          where: {
            uuid: {
              in: userIds,
            },
          },
        });

        return users.map((user) => ({
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        }));
      },
    });

    // Get participating users from your database, minus the author
    const users = await db.user.findMany({
      where: {
        uuid: {
          in: participantIds.filter((uuid) => uuid !== comment.userId),
        },
      },
    });

    const { id: projectId, name: projectName } = await db.project.findFirstOrThrow({
      where: {
        roomId,
      },
    });

    // Persist comment to our db
    await db.project.update({
      where: {
        id: projectId,
      },
      data: {
        liveblocksComments: {
          push: {
            comment,
            participantIds,
            htmlComment,
          },
        },
      },
    });
    console.log(`Persisted comment data for room ${roomId}`);

    // If any affiliated users are not contributors, make them read-only
    const contributors = (
      await db.contributor.findMany({
        select: {
          userId: true,
        },
        where: {
          userId: {
            in: users.map((u) => u.id),
          },
          projectId,
        },
      })
    ).map((c) => c.userId);
    const missingParticipants = users.filter((u) => !contributors.includes(u.id)).map((p) => p.id);
    if (missingParticipants) {
      await db.contributor.createMany({
        data: missingParticipants.map((id) => ({
          userId: id,
          projectId,
          role: ContributorRole.ReadOnly,
        })),
      });
    }

    const supabaseAdminClient = createAdminClient();

    // Send notifications
    // todo: use allSettled
    for await (const user of users) {
      const { data, error } = await supabaseAdminClient.auth.admin.generateLink({
        type: "magiclink",
        email: user.email,
      });
      if (error || !data.properties?.hashed_token) {
        console.error(
          `Failed to generate magic link to send flow comment notifications for ${user.email}`,
        );
      }
      const mailService = new MailService(user);
      await mailService.sendLiveblocksCommentNotificationEmail({
        to: user.email,
        projectName,
        initialHtml: htmlComment,
        context: {
          path: `/projects/${projectId}`,
          token_hash: data.properties!.hashed_token,
        },
      });
    }
  }
};
