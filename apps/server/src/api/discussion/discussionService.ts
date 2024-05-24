import {
  CreateDiscussionSchema,
  SetDiscussionParticipantsSchema,
  CompleteDiscussionSchema,
  CreateLinkedDocumentSchema,
  UpdateLinkedDocumentSchema,
  UpdateDiscussionSchema,
  PaginationSchema,
  DiscussionCommentContentSchema,
  FileAttachmentSchema,
  discussionSchema,
} from "xylem";
import { ContributorRole, FileAttachment, Prisma } from "@prisma/client";
import { BaseUserRefSelectArgs } from "../user/types";
import { OperationContextUser } from "@/common/types";
import { db } from "@/common/db";
import { DefaultContributorsSelectArgs } from "../project/types";
import RizomeError, { ErrorName } from "@/common/rizomeError";
import { DiscussionEventType } from "./events/discussionEventType";
import { userBelongsToOrgGuard } from "@/lib/user";
import moment from "moment";
import { DiscussionAddedAsParticipantEvent } from "./events/dicussionAddedAsParticipantEvent";
import { DiscussionCompletedEvent } from "./events/discussionCompletedEvent";
import { DiscussionCommentMentionEvent } from "./events/discussionCommentMentionEvent";
import {
  FilePathComponent,
  generateSignedAttachmentUrl,
  generateSignedAttachmentUploadUrl,
} from "@/lib/storage";
import { fileAttachmentToXylem } from "@/common/serde";
import { v4 as uuidgen } from "uuid";
import { DiscussionWithRelationships } from "./types";
import { discussionToXylem } from "./serde";
import { eventEmitter } from "@/events/localEventsHandler";

// fixme: lowercase the const & improve typing so I can access the return type in xylem serde calls
export const DefaultDiscussionIncudes: Prisma.DiscussionInclude = {
  creator: {
    select: BaseUserRefSelectArgs,
  },
};

/**
 * fixme: readdress this. it seems like it's a duplicated db call in a lot of places.
 *
 * @param user
 * @param id
 * @param includeArgs If you are going to include and select on participants, always include id
 * @returns
 */
const _getByIdAsync = async (
  user: OperationContextUser,
  id: number,
  includeArgs?: Prisma.DiscussionInclude,
) => {
  const organization = userBelongsToOrgGuard(user);

  const include: Prisma.DiscussionInclude = includeArgs || {};

  if (!include.participants) {
    include.participants = {
      select: { id: true },
    };
  }

  return db.discussion.findFirstOrThrow({
    where: {
      id,
      organizationId: organization.id,
    },
    include,
  });
};

// todo: readdress this
const _addParticipantsIfNeededAsync = async (
  user: OperationContextUser,
  projectId: number,
  discussionId: number,
  userIdsOfParticipantsToAdd: number[],
  currentParticipantIds?: number[],
) => {
  const organization = userBelongsToOrgGuard(user);
  if (!currentParticipantIds) {
    const { participants } = await db.discussion.findFirstOrThrow({
      where: {
        id: discussionId,
        organizationId: organization.id,
      },
      select: {
        participants: {
          select: {
            id: true,
          },
        },
      },
    });
    currentParticipantIds = participants.map((x) => x.id);
  }

  const { contributors } = await db.project.findFirstOrThrow({
    where: {
      id: projectId,
    },
    include: {
      contributors: {
        select: {
          userId: true,
        },
      },
    },
  });
  const contributorIds = contributors.map((x) => x.userId);
  const participantIds = currentParticipantIds;

  const idsOfNewParticipants: number[] = [];
  const participants = await db.$transaction(async (tx) => {
    userIdsOfParticipantsToAdd.forEach(async (id) => {
      if (!contributorIds.includes(id)) {
        idsOfNewParticipants.push(id);
        await tx.contributor.create({
          data: {
            role: ContributorRole.ReadOnly,
            project: {
              connect: {
                id: projectId,
              },
            },
            user: {
              connect: {
                id,
              },
            },
          },
        });
      }
    });

    const participantsToAdd = userIdsOfParticipantsToAdd
      .filter((id) => !participantIds.includes(id))
      .map((id) => ({ id }));

    if (participantsToAdd.length) {
      const discussionWithParticipants = await tx.discussion.update({
        where: {
          id: discussionId,
        },
        data: {
          participants: {
            connect: participantsToAdd,
          },
        },
        select: {
          participants: {
            select: BaseUserRefSelectArgs,
          },
        },
      });

      return discussionWithParticipants.participants;
    } else {
      return (
        await tx.discussion.findFirstOrThrow({
          where: {
            id: discussionId,
            organizationId: user.organization!.id, // compiler forgets we check the type on this earlier
          },
          select: {
            participants: {
              select: BaseUserRefSelectArgs,
            },
          },
        })
      ).participants;
    }
  });

  if (idsOfNewParticipants.length) {
    eventEmitter.emitAsync(
      DiscussionEventType.ParticipantAdded,
      new DiscussionAddedAsParticipantEvent(user, projectId, discussionId, idsOfNewParticipants),
    );
  }

  return participants;
};

// todo: put more of this in a transaction
export const createAsync = async (user: OperationContextUser, payload: CreateDiscussionSchema) => {
  const organization = userBelongsToOrgGuard(user);
  const projectWithContributors = await db.project.findFirstOrThrow({
    where: {
      id: payload.projectId,
      organizationId: organization.id,
    },
    include: {
      contributors: { select: DefaultContributorsSelectArgs },
    },
  });

  const userAsContributor = projectWithContributors.contributors?.find(
    (x) => x.user?.id === user.id,
  );
  const validContributorRoles = [
    ContributorRole.Approver,
    ContributorRole.Contributor,
    ContributorRole.Owner,
  ];
  const userContributorRole = validContributorRoles.find((x) => x === userAsContributor?.role);

  if (!userAsContributor || !userContributorRole) {
    throw new RizomeError(
      ErrorName.BadRequest,
      `User must have one of the following roles: ${validContributorRoles.join(", ")}`,
    );
  }

  const participantIds =
    !payload.participantIds || payload.participantIds.length > 0
      ? await db.user.findMany({
          where: {
            id: {
              in: payload.participantIds,
            },
            organizationId: organization.id,
          },
          select: {
            id: true,
          },
        })
      : [];

  // add owner as participant
  const ownerId = projectWithContributors.contributors?.find(
    (x) => x.role === ContributorRole.Owner,
  )?.user?.id;
  if (ownerId) {
    participantIds.push({ id: ownerId });
  }

  // add context user as participant
  if (!participantIds.some((x) => x.id === user.id)) {
    participantIds.push({ id: user.id });
  }

  const discussion = await db.discussion.create({
    data: {
      topic: payload.topic,
      name: payload.name,
      creator: {
        connect: { id: user.id },
      },
      project: {
        connect: { id: projectWithContributors.id },
      },
      organization: { connect: { id: organization.id } },
      participants: { connect: participantIds },
    },
    include: DefaultDiscussionIncudes,
  });

  // If payload participants are not project contributors, make them ReadOnly on the project
  if (payload.participantIds) {
    const contributors = await db.contributor.findMany({
      select: {
        userId: true,
      },
      where: {
        projectId: payload.projectId,
      },
    });
    const nonContributorParticipantIds = payload.participantIds.filter(
      (id) => !contributors.map((c) => c.userId).includes(id),
    );
    if (nonContributorParticipantIds.length > 0) {
      // todo: make this an allsettled
      nonContributorParticipantIds.forEach(async (id) => {
        await db.contributor.create({
          data: {
            role: ContributorRole.ReadOnly,
            project: {
              connect: {
                id: payload.projectId,
              },
            },
            user: {
              connect: {
                id,
              },
            },
          },
        });
      });
      // await db.$transaction(async (tx) => {
      //   // Prisma doesn't have a connect in createMany option
      //   nonContributorParticipantIds.forEach(async id => {
      //     await tx.contributor.create({
      //       data: {
      //         role: ContributorRole.ReadOnly,
      //         project: {
      //           connect: {
      //             id: payload.projectId,
      //           },
      //         },
      //         user: {
      //           connect: {
      //             id,
      //           },
      //         },
      //       }
      //     })
      //   });
      // });
      console.log(
        `Created ${nonContributorParticipantIds.length} new project contributors as read only`,
      );
    }
  }

  // Emit notification events for participants (except for context user)
  eventEmitter.emitAsync(
    DiscussionEventType.ParticipantAdded,
    new DiscussionAddedAsParticipantEvent(
      user,
      payload.projectId,
      discussion.id,
      participantIds.map((x) => x.id).filter((x) => x !== user.id),
    ),
  );

  return discussion;
};

export const getDiscussionByIdAsync = async (user: OperationContextUser, id: number) => {
  const discussion = await _getByIdAsync(user, id, {
    fileAttachments: true,
    linkedDocuments: true,
  });
  const discussionWithRelationships: DiscussionWithRelationships = {
    ...discussion,
    comments: undefined,
    projectApproval: discussion.projectApproval ?? undefined,
    creator: user,
  };
  const { fileAttachments, ...discussionSchema } = discussionToXylem(discussionWithRelationships);

  if (!fileAttachments) {
    return discussionSchema;
  }
  const attachmentsWithSignedUrls = await Promise.all(
    fileAttachments.map(async (f) => {
      const signedUrl = await generateSignedAttachmentUrl(f.path);
      return {
        ...f,
        downloadUrl: signedUrl,
      };
    }),
  );
  return {
    ...discussionSchema,
    fileAttachments: attachmentsWithSignedUrls,
  };
};

export const getAllParticipantsByDiscussionIdAsync = async (
  user: OperationContextUser,
  id: number,
) => {
  const { participants } = await _getByIdAsync(user, id, {
    participants: {
      select: BaseUserRefSelectArgs,
    },
  });

  return participants;
};

/**
 * Set the participants of a discussion
 * If any participants are not some kind of contributor to the project, create them as ReadOnly contributors
 *
 * @param user
 * @param id
 * @param payload
 * @returns
 */
export const setParticipantsAsync = async (
  user: OperationContextUser,
  id: number,
  payload: SetDiscussionParticipantsSchema,
) => {
  const organization = userBelongsToOrgGuard(user);
  const { participants, creatorId, projectId } = await _getByIdAsync(user, id, {
    participants: {
      select: BaseUserRefSelectArgs,
    },
  });

  const currentParticipantIds = participants.filter((x) => x.id !== creatorId).map((x) => x.id);

  const idsOfUsersToSet = (
    await db.user.findMany({
      where: {
        id: {
          in: payload.participantIds,
        },
        organizationId: organization.id,
      },
      select: {
        id: true,
      },
    })
  ).map((x) => x.id);

  const idsOfParticipantsToRemove = currentParticipantIds.filter(
    (x) => !idsOfUsersToSet.includes(x),
  );

  if (idsOfParticipantsToRemove.length) {
    await db.discussion.update({
      where: {
        id,
      },
      data: {
        participants: {
          disconnect: idsOfParticipantsToRemove.map((id) => ({ id })),
        },
      },
    });
  }

  return await _addParticipantsIfNeededAsync(user, projectId, id, idsOfUsersToSet);
};

export const completeAsync = async (
  user: OperationContextUser,
  id: number,
  payload: CompleteDiscussionSchema,
) => {
  const organization = userBelongsToOrgGuard(user);
  const { completedAt } = await _getByIdAsync(user, id);

  if (completedAt) {
    throw new RizomeError(ErrorName.BadRequest, "Discussion already completed");
  }

  const discussion = await db.discussion.update({
    where: {
      id: id,
      organizationId: organization.id,
    },
    data: {
      ...payload,
      completedAt: moment().toDate(),
    },
    include: DefaultDiscussionIncudes,
  });

  eventEmitter.emitAsync(DiscussionEventType.Completed, new DiscussionCompletedEvent(user, id));

  return discussion;
};

// todo: there needs to be better validation here
export const createLinkedDocumentAsync = async (
  user: OperationContextUser,
  discussionId: number,
  payload: CreateLinkedDocumentSchema,
) => {
  const { url, name, ...rest } = payload;
  if (!url) throw new RizomeError(ErrorName.BadRequest, "url must be defined");
  if (!name) throw new RizomeError(ErrorName.BadRequest, "name must be defined");
  await _getByIdAsync(user, discussionId);
  return db.discussionLinkedDocument.create({
    data: {
      url,
      name,
      ...rest,
      discussion: {
        connect: { id: discussionId },
      },
    },
  });
};

export const removeLinkedDocumentAsync = async (
  user: OperationContextUser,
  discussionId: number,
  id: number,
) => {
  await _getByIdAsync(user, discussionId);
  return db.discussionLinkedDocument.delete({
    where: {
      id,
      discussionId,
    },
  });
};

export const updateLinkedDocumentAsync = async (
  user: OperationContextUser,
  discussionId: number,
  id: number,
  payload: UpdateLinkedDocumentSchema,
) => {
  await _getByIdAsync(user, discussionId);
  return db.discussionLinkedDocument.update({
    where: {
      id,
      discussionId,
    },
    data: payload,
  });
};

// fixme: this contains weird logic regarding how completion is saved
export const updateByIdAsync = async (
  user: OperationContextUser,
  id: number,
  payload: UpdateDiscussionSchema,
) => {
  const organization = userBelongsToOrgGuard(user);
  // may be undefined
  const { completedAt } = await _getByIdAsync(user, id);
  // TODO: support updating participants list and sending out events
  const hasOutcome = payload.outcome && payload.outcome.length > 0;
  const discussion = await db.discussion.update({
    where: {
      id: id,
      organizationId: organization.id,
    },
    data: {
      name: payload.name,
      ...payload,
      completedAt: completedAt ?? payload.completedAt,
    },
    include: DefaultDiscussionIncudes,
  });

  if (!completedAt && hasOutcome) {
    eventEmitter.emitAsync(DiscussionEventType.Completed, new DiscussionCompletedEvent(user, id));
  }

  return discussion;
};

export const getCommentsByDiscussionIdAsync = async (
  user: OperationContextUser,
  discussionId: number,
  pageSize = 25,
  pagination?: PaginationSchema,
) => {
  await _getByIdAsync(user, discussionId);
  const comments = await db.discussionComment.findMany({
    // skip: pagination?.pageToken ? 1 : undefined,
    // cursor: pagination?.pageToken?.cursor
    //   ? {
    //       id: pagination.pageToken.cursor,
    //     }
    //   : undefined,
    // take: pageSize + 1,
    where: {
      discussionId,
    },
    include: {
      creator: {
        select: BaseUserRefSelectArgs,
      },
      fileAttachments: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  // const hasNextPage = comments.length > pageSize;

  // if (hasNextPage) {
  //   comments.pop();
  // }

  // todo: short circuit or resolve?
  const commentsWithSignedAttachmentUrls = await Promise.all(
    comments.flatMap(async (c) => {
      const attachments: FileAttachmentSchema[] = await Promise.all(
        c.fileAttachments.map(async (f: FileAttachment) => {
          const signedUrl = await generateSignedAttachmentUrl(f.path);
          return {
            ...fileAttachmentToXylem(f),
            downloadUrl: signedUrl,
          };
        }),
      );
      return {
        ...c,
        attachedFiles: attachments,
      };
    }),
  );

  return { comments: commentsWithSignedAttachmentUrls };
};

export const attachFileToDiscussion = async (
  user: OperationContextUser,
  discussionId: number,
  fileName: string,
): Promise<FileAttachmentSchema> => {
  const organization = userBelongsToOrgGuard(user); // todo: this should go into context middleware
  const { projectId } = await db.discussion.findFirstOrThrow({
    select: {
      projectId: true,
    },
    where: {
      id: discussionId,
    },
  });
  const filePathComponents: FilePathComponent[] = [
    {
      directory: "organization",
      id: organization.id,
    },
    {
      directory: "project",
      id: projectId,
    },
    {
      directory: "discussion",
      id: discussionId,
    },
  ];
  const uploadSchema = await generateSignedAttachmentUploadUrl(filePathComponents, fileName);
  await db.fileAttachment.create({
    data: {
      uuid: uploadSchema.id,
      path: uploadSchema.path,
      name: uploadSchema.fileName,
      projectId,
      discussionId,
    },
  });
  return {
    ...uploadSchema,
    discussionId,
  };
};

// fixme: dead code
export const attachFileToDiscussionComment = async (
  user: OperationContextUser,
  discussionId: number,
  discussionCommentId: number,
  fileName: string,
): Promise<FileAttachmentSchema> => {
  const organization = userBelongsToOrgGuard(user); // todo: this should go into context middleware
  const { projectId } = await db.discussion.findFirstOrThrow({
    select: {
      projectId: true,
    },
    where: {
      id: discussionId,
    },
  });
  const filePathComponents: FilePathComponent[] = [
    {
      directory: "organization",
      id: organization.id,
    },
    {
      directory: "project",
      id: projectId,
    },
    {
      directory: "discussion",
      id: discussionId,
    },
    {
      directory: "discussionComment",
      id: discussionCommentId,
    },
  ];
  const uploadSchema = await generateSignedAttachmentUploadUrl(filePathComponents, fileName);
  await db.fileAttachment.create({
    data: {
      uuid: uploadSchema.id,
      path: uploadSchema.path,
      name: uploadSchema.fileName,
      projectId,
      discussionId,
      discussionCommentId,
    },
  });
  return {
    ...uploadSchema,
    projectId,
    discussionId,
    discussionCommentId,
  };
};

// Return type defined below this function; no circular references allowed
export const createCommentAsync = async (
  user: OperationContextUser,
  discussionId: number,
  payload: DiscussionCommentContentSchema,
) => {
  const organization = userBelongsToOrgGuard(user);
  const mentionUsers = payload.mentions?.length
    ? await db.user.findMany({
        where: {
          id: {
            in: payload.mentions.map((x) => x.userId),
          },
          organizationId: organization.id,
        },
        select: BaseUserRefSelectArgs,
      })
    : [];

  const { participants, projectId, organizationId } = await _getByIdAsync(user, discussionId, {
    participants: mentionUsers?.length
      ? {
          select: {
            id: true,
          },
        }
      : undefined,
  });

  const comment = await db.discussionComment.create({
    data: {
      content: payload,
      contentVersion: undefined,
      discussion: {
        connect: {
          id: discussionId,
        },
      },
      creator: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  if (mentionUsers?.length) {
    // add users to proj and discussion if needed.
    await _addParticipantsIfNeededAsync(
      user,
      projectId,
      discussionId,
      mentionUsers.map((x) => x.id),
      participants.map((x) => x.id),
    );

    eventEmitter.emitAsync(
      DiscussionEventType.CommentMention,
      new DiscussionCommentMentionEvent(
        user,
        projectId,
        discussionId,
        comment.id,
        mentionUsers.map((x) => x.id),
      ),
    );
  }

  return {
    ...comment,
    creator: user,
  };
};

// Prisma advanced typing:
// https://www.prisma.io/docs/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types#problem-getting-access-to-the-return-type-of-a-function
export type CreateCommentAsyncReturn = Prisma.PromiseReturnType<typeof createCommentAsync>;
