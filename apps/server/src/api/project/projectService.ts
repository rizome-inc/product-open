import {
  ContributorRole,
  Discussion,
  Prisma,
  Project,
  ProjectApprovalResponse,
  ProjectStatus,
} from "@prisma/client";
import { DefaultContributorsSelectArgs } from "./types";
import { BaseUserRefSelectArgs } from "@/api/user/types";
import { db } from "@/common/db";
import { OperationContextUser } from "@/common/types";
import { isAdmin, userBelongsToOrgGuard } from "@/lib/user";
import {
  ProjectContentSchema,
  UpdateProjectContentSchema,
  CreateProjectFromTemplateSchema,
  ProjectApprovalResponseSchema,
  RenameProjectSchema,
  SetContributorsSchema,
  ContributorSchema,
  fileAttachmentSchema,
  FileAttachmentSchema,
  projectContentSchema,
  CreateContributorSchema,
  CreateFlowProjectSchema,
  WorkTrackingSchema,
} from "xylem";
import RizomeError, { ErrorName } from "@/common/rizomeError";
import moment from "moment";
import { ProjectEventType } from "./events/projectEventType";
import { ProjectContributorsAddedEvent } from "./events/contributorsAddedEvent";
import { ProjectPublishedEvent } from "./events/publishedEvent";
import { getProjectTemplateById } from "../projectTemplate/projectTemplateService";
import { v4 as uuidgen } from "uuid";
import { indexAllAttachmentNodes } from "./util";
import {
  FilePathComponent,
  generateSignedAttachmentUrl,
  generateSignedAttachmentUploadUrl,
} from "@/lib/storage";
import { flowProjectToXylem, projectToXylem } from "./serde";
import { eventEmitter } from "@/events/localEventsHandler";
import { liveblocksClient } from "@/lib/liveblocks";
import { RoomInfo } from "@liveblocks/node";

const checkProjectOrgMatchesUserOrgAsync = async (user: OperationContextUser, id: number) => {
  const organization = userBelongsToOrgGuard(user);
  return db.project.findFirstOrThrow({
    where: {
      id,
      organizationId: organization.id,
    },
    select: {
      id: true,
    },
  });
};

const DefaultProjectIncudes: Prisma.ProjectInclude = {
  contributors: {
    select: DefaultContributorsSelectArgs,
  },
  creator: {
    select: BaseUserRefSelectArgs,
  },
  discussions: {
    include: {
      participants: {
        select: BaseUserRefSelectArgs,
      },
      comments: {
        include: {
          creator: {
            select: BaseUserRefSelectArgs,
          },
        },
      },
    },
  },
};

/**
 * all where user is contributor or all in the case of admin user
 * @param user
 * @returns
 */
export const getAllActiveProjects = (user: OperationContextUser) => {
  return db.project.findMany({
    select: {
      id: true,
      name: true,
      bussinessUnit: true,
      updatedAt: true,
      roomId: true,
    },
    where: {
      organizationId: user.organizationId,
      status: ProjectStatus.Active,
      contributors: isAdmin(user.roles)
        ? undefined
        : {
            some: {
              userId: user.id,
            },
          },
      roomId: {
        not: null,
      },
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        name: "desc",
      },
    ],
  });
};

// fixme: this loose typing doesn't help anyone. break into different functions with better Prisma typing
// I'm always going to include contributors for the time being
export const getProjectById = async (
  user: OperationContextUser,
  id: number,
  includesObject: {
    contributors?: boolean;
    discussions?: boolean;
  } = {},
) => {
  if (!user.organization) {
    throw new Error("User organization must be set");
  }
  const project = await db.project.findFirstOrThrow({
    where: {
      id,
      organizationId: user.organization.id, // todo: determine if there's a way to handle this restriction more easily, or if we should configure RLS
    },
    include: {
      discussions: includesObject.discussions,
      contributors: {
        include: {
          user: true,
        },
      },
    },
  });
  // Find the nodes with set attachment ids, convert paths into signed urls and set data.
  const xylemProject = projectToXylem(project);
  const attachmentIndexes = indexAllAttachmentNodes(xylemProject.content);
  // todo: batch this
  let partialFailure = false;
  for await (const index of attachmentIndexes) {
    // Skip nodes that don't have set attachments yet
    if (!index.value?.path) {
      continue;
    }
    const parsedValue = fileAttachmentSchema.parse(index.value);
    try {
      const signedUrl = await generateSignedAttachmentUrl(parsedValue.path);
      xylemProject.content.categories[index.categoryIndex].fields[index.fieldIndex].value = {
        ...xylemProject.content.categories[index.categoryIndex].fields[index.fieldIndex].value,
        downloadUrl: signedUrl,
      };
    } catch (e) {
      partialFailure = true;
      continue;
    }
  }
  return {
    ...xylemProject,
    partialFailure,
  };
};

export const getFlowProjectById = async (user: OperationContextUser, id: number) => {
  if (!user.organization) {
    throw new Error("User organization must be set");
  }
  const project = await db.project.findFirstOrThrow({
    where: {
      id,
      organizationId: user.organization.id, // todo: determine if there's a way to handle this restriction more easily, or if we should configure RLS
    },
    include: {
      contributors: {
        include: {
          user: true,
        },
      },
    },
  });
  // Find the nodes with set attachment ids, convert paths into signed urls and set data.
  const xylemProject = flowProjectToXylem(project);
  // const attachmentIndexes = indexAllAttachmentNodes(xylemProject.content);
  // todo: batch this
  const partialFailure = false;
  // for await (const index of attachmentIndexes) {
  //   // Skip nodes that don't have set attachments yet
  //   if (!index.value?.path) {
  //     continue;
  //   }
  //   const parsedValue = fileAttachmentSchema.parse(index.value);
  //   try {
  //     const signedUrl = await generateSignedAttachmentUrl(parsedValue.path);
  //     xylemProject.content.categories[index.categoryIndex].fields[index.fieldIndex].value = {
  //       ...xylemProject.content.categories[index.categoryIndex].fields[index.fieldIndex].value,
  //       downloadUrl: signedUrl,
  //     };
  //   } catch (e) {
  //     partialFailure = true;
  //     continue;
  //   }
  // }
  return {
    ...xylemProject,
    partialFailure,
  };
};

export const attachFile = async (
  user: OperationContextUser,
  projectId: number,
  fileName: string,
): Promise<FileAttachmentSchema> => {
  const organization = userBelongsToOrgGuard(user); // todo: this should go into context middleware
  const filePathComponents: FilePathComponent[] = [
    {
      directory: "organization",
      id: organization.id,
    },
    {
      directory: "project",
      id: projectId,
    },
  ];
  const uploadSchema = await generateSignedAttachmentUploadUrl(filePathComponents, fileName);
  await db.fileAttachment.create({
    data: {
      uuid: uploadSchema.id,
      path: uploadSchema.path,
      name: uploadSchema.fileName,
      projectId,
    },
  });
  return {
    ...uploadSchema,
    projectId,
  };
};

/**
 * Overwrites project data
 * File uploads are pre-processed during signed upload url handshake
 *
 * todo: refactor the signed url download logic in `getProjectById` so I don't need a second db call
 *
 * @param user
 * @param id
 * @param payload
 * @returns
 */
export const updateProject = async (
  user: OperationContextUser,
  id: number,
  payload: UpdateProjectContentSchema,
) => {
  const organization = userBelongsToOrgGuard(user);
  const { content, workTrackingName, workTrackingUrl } = payload;

  await db.project.update({
    where: {
      id,
      organizationId: organization.id,
    },
    data: {
      content: content as Prisma.JsonObject,
      workTrackingName,
      workTrackingUrl,
    },
  });

  return getProjectById(user, id);
};

export const updateFlowProject = async (
  user: OperationContextUser,
  id: number,
  payload: WorkTrackingSchema,
) => {
  const organization = userBelongsToOrgGuard(user);
  const { workTrackingName, workTrackingUrl } = payload;

  await db.project.update({
    where: {
      id,
      organizationId: organization.id,
    },
    data: {
      workTrackingName,
      workTrackingUrl,
    },
  });

  return getFlowProjectById(user, id);
};

export const getAllContributorsByProjectIdAsync = async (
  user: OperationContextUser,
  projectId: number,
) => {
  await checkProjectOrgMatchesUserOrgAsync(user, projectId);
  return db.contributor.findMany({
    where: {
      projectId,
    },
    select: DefaultContributorsSelectArgs,
  });
};

export const getAllDiscussionsByProjectIdAsync = async (
  user: OperationContextUser,
  projectId: number,
) => {
  await checkProjectOrgMatchesUserOrgAsync(user, projectId);

  return db.discussion.findMany({
    where: {
      projectId,
    },
    orderBy: [
      {
        completedAt: {
          sort: "asc",
          nulls: "first",
        },
      },
      {
        updatedAt: "desc",
      },
    ],
  });
};

export const setContributorsAsync = async (
  user: OperationContextUser,
  projectId: number,
  payload: SetContributorsSchema,
) => {
  await checkProjectOrgMatchesUserOrgAsync(user, projectId);

  // fixme: check whether this is valuable to re-include, or if it's just overcomplicated
  // type SortedCollectionOfContributors<T> = Record<
  //   typeof AllContributorRoles[number],
  //   T[]
  // >;

  // function sortContributors<T extends { role: ContributorRole }>(
  //   contributors: T[]
  // ) {
  //   return AllContributorRoles.reduce<Partial<SortedCollectionOfContributors<T>>>(
  //     (res, x) => {
  //       res[x] = contributors.filter((y) => y.role === x);
  //       return res;
  //     },
  //     {} as Partial<SortedCollectionOfContributors<T>>
  //   );
  // }

  const sortedContributorsDto: Map<ContributorRole, CreateContributorSchema[]> =
    payload.contributors.reduce((acc, c) => {
      if (!c.role) return acc; // shouldn't occur, but could
      const castRole = c.role as ContributorRole;
      if (acc.get(castRole)) {
        acc.set(castRole, [...acc.get(castRole)!, c]);
      } else {
        acc.set(castRole, [c]);
      }
      return acc;
    }, new Map<ContributorRole, CreateContributorSchema[]>());

  if (
    sortedContributorsDto.get(ContributorRole.Owner) &&
    sortedContributorsDto.get(ContributorRole.Owner)!.length === 0
  ) {
    throw new RizomeError(ErrorName.BadRequest, "Project must have a least one owner.");
  }

  if (
    new Set<number>(payload.contributors.map((c) => c.userId)).size !== payload.contributors.length
  ) {
    throw new RizomeError(ErrorName.BadRequest, "Contributors cannot have more than one role.");
  }

  const contributorRefs = await db.contributor.findMany({
    where: {
      projectId,
    },
    select: {
      userId: true,
      id: true,
    },
  });

  const userIdsOfExistingContributors = contributorRefs.map((x) => x.userId);
  const contributorsAdded: CreateContributorSchema[] = [];

  const contributors = await db.$transaction(async (tx) => {
    const promises = payload.contributors.map(async (contributor) => {
      const userId = contributor.userId;
      const id = contributorRefs.find((x) => x.userId === userId)?.id;
      if (id && id > 0) {
        return tx.contributor.update({
          where: {
            id,
          },
          data: {
            role: contributor.role as ContributorRole,
          },
          select: DefaultContributorsSelectArgs,
        });
      } else {
        contributorsAdded.push(contributor);
        return tx.contributor.create({
          data: {
            role: contributor.role as ContributorRole,
            project: {
              connect: {
                id: projectId,
              },
            },
            user: {
              connect: {
                id: userId,
              },
            },
          },
          select: DefaultContributorsSelectArgs,
        });
      }
    });

    // delete records of removed contributors
    const userIds = payload.contributors.map((x) => x.userId);
    const userIdsOfContributorsToRemove = userIdsOfExistingContributors.filter(
      (x) => !userIds.includes(x),
    );

    await tx.contributor.deleteMany({
      where: {
        projectId: projectId,
        userId: {
          in: userIdsOfContributorsToRemove,
        },
      },
    });

    return await Promise.all(promises);
  });

  if (contributorsAdded.length > 0) {
    eventEmitter.emitAsync(
      ProjectEventType.ContributorAdded,
      new ProjectContributorsAddedEvent(
        user,
        projectId,
        contributorsAdded.map((x) => ({
          role: x.role as ContributorRole,
          userId: x.userId,
        })),
      ),
    );
  }

  contributors.sort((a, b) => {
    if (a.role === ContributorRole.Owner) {
      return -1;
    } else if (b.role === ContributorRole.Owner) {
      return 1;
    } else if (a.role === ContributorRole.Contributor) {
      return -1;
    } else if (b.role === ContributorRole.Contributor) {
      return 1;
    } else if (a.role === ContributorRole.Approver) {
      return -1;
    } else if (b.role === ContributorRole.Approver) {
      return 1;
    }
    return 0;
  });
  console.log(contributors);
  return contributors;
};

export const renameAsync = async (
  user: OperationContextUser,
  id: number,
  { name }: RenameProjectSchema,
) => {
  if (!isAdmin(user.roles))
    throw new RizomeError(ErrorName.Forbidden, "Only admins can change project names");
  await checkProjectOrgMatchesUserOrgAsync(user, id);
  return db.project.update({
    where: {
      id,
    },
    data: {
      name,
    },
    include: DefaultProjectIncudes,
  });
};

export const publishAsync = async (user: OperationContextUser, projectId: number) => {
  await checkProjectOrgMatchesUserOrgAsync(user, projectId);

  const approvers = (
    await db.contributor.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            ...BaseUserRefSelectArgs,
            preferences: true,
          },
        },
      },
    })
  )?.filter((x) => x.role === ContributorRole.Approver);

  if (approvers?.length <= 0) {
    throw new RizomeError(ErrorName.BadRequest, "Must have at least 1 approver to publish.");
  }

  const project: Project = await db.project.update({
    where: {
      id: projectId,
    },
    data: {
      publishedAt: moment().toDate(),
    },
    include: DefaultProjectIncudes,
  });

  eventEmitter.emitAsync(ProjectEventType.Published, new ProjectPublishedEvent(user, project));
  return project;
};

// todo: decide if we want to add custom ACL metadata: https://liveblocks.io/docs/api-reference/liveblocks-node#post-rooms
export const createFlow = async (user: OperationContextUser, payload: CreateFlowProjectSchema) => {
  const organization = userBelongsToOrgGuard(user);
  const roomId = `org_${user.organizationId}:${uuidgen()}`;
  const room: RoomInfo = await liveblocksClient.createRoom(roomId, {
    defaultAccesses: ["room:write"],
  });

  return db.project.create({
    data: {
      bussinessUnit: payload.businessUnit,
      contributors: {
        create: {
          role: ContributorRole.Owner,
          userId: user.id,
        },
      },
      creatorId: user.id,
      name: payload.name,
      organizationId: organization.id,
      roomId,
      example: payload.example,
    },
    include: {
      contributors: {
        select: DefaultContributorsSelectArgs,
      },
    },
  });
};

export const createFromTemplateAsync = async (
  user: OperationContextUser,
  payload: CreateProjectFromTemplateSchema,
) => {
  const organization = userBelongsToOrgGuard(user);
  const template = await getProjectTemplateById(user, payload.templateId);

  // inject uuid ids into fields
  const formFieldsValue: ProjectContentSchema = projectContentSchema.parse(template.content);
  formFieldsValue.categories.forEach((category) => {
    category.fields.forEach((field) => (field.id = uuidgen()));
  });

  return db.project.create({
    data: {
      bussinessUnit: payload.businessUnit,
      content: formFieldsValue as Prisma.JsonObject,
      contributors: {
        create: {
          role: ContributorRole.Owner,
          userId: user.id,
        },
      },
      creatorId: user.id,
      name: payload.name,
      organizationId: organization.id,
      templateId: template.id,
    },
    include: {
      contributors: {
        select: DefaultContributorsSelectArgs,
      },
    },
  });
};

export const getApprovalsAsync = async (user: OperationContextUser, projectId: number) => {
  await checkProjectOrgMatchesUserOrgAsync(user, projectId);

  return db.projectApproval.findMany({
    where: {
      projectId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      discussion: {
        select: {
          id: true,
        },
      },
      creator: {
        select: BaseUserRefSelectArgs,
      },
    },
  });
};

export const getApprovalHistoryAsync = async (user: OperationContextUser, projectId: number) => {
  await checkProjectOrgMatchesUserOrgAsync(user, projectId);

  return db.projectApproval.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      discussion: {
        select: {
          id: true,
        },
      },
      // creator: {
      //   select: BaseUserRefSelectArgs,
      // },
    },
  });
};

export const addApprovalResponse = async (
  user: OperationContextUser,
  projectId: number,
  payload: ProjectApprovalResponseSchema,
) => {
  const organization = userBelongsToOrgGuard(user);
  if (payload.response === ProjectApprovalResponse.Rejected && !payload.discussionName) {
    throw new RizomeError(ErrorName.BadRequest, '"Discussion name is required"');
  }

  const projectWithContributors = await getProjectById(user, projectId, {
    contributors: true,
  });

  if (!projectWithContributors.publishedAt) {
    throw new RizomeError(ErrorName.BadRequest, "Project must be published to record a response");
  }

  if (
    !projectWithContributors?.contributors?.some(
      (c) => c.user?.id === user.id && c.role === ContributorRole.Approver,
    )
  ) {
    throw new RizomeError(
      ErrorName.BadRequest,
      "You must be an approver on this project to record a response",
    );
  }

  const approvalAndParticipantIds = await db.$transaction(async (tx) => {
    // grab ids of currently active responses for the given user
    const activeIds = await tx.projectApproval.findMany({
      where: {
        isActive: true,
        projectId,
        creatorId: user.id,
      },
      select: {
        id: true,
      },
    });

    // set all others isActive = false
    if (activeIds?.length) {
      await tx.projectApproval.updateMany({
        where: {
          id: {
            in: activeIds.map((x) => x.id),
          },
        },
        data: {
          isActive: false,
        },
      });
    }

    // create a discussion, if needed
    let discussion: Discussion | null = null;
    let participantIds: { id: number }[] = [];
    if (payload.response === ProjectApprovalResponse.Rejected) {
      participantIds =
        payload.participantIds?.length > 0
          ? await tx.user.findMany({
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

      discussion = await tx.discussion.create({
        data: {
          name: payload.discussionName!,
          topic: payload.rejectionReason || undefined,
          creator: {
            connect: {
              id: user.id,
            },
          },
          organization: {
            connect: {
              id: organization.id,
            },
          },
          project: {
            connect: {
              id: projectId,
            },
          },
          participants: {
            connect: participantIds,
          },
        },
      });
    }

    // add this one as isActive === true
    const approval = await tx.projectApproval.create({
      data: {
        isActive: true,
        rejectionReason: payload.rejectionReason,
        response: payload.response as ProjectApprovalResponse,
        project: {
          connect: {
            id: projectId,
          },
        },
        creator: {
          connect: {
            id: user.id,
          },
        },
        discussion: discussion
          ? {
              connect: {
                id: discussion.id,
              },
            }
          : undefined,
      },
    });
    return {
      ...approval,
      participantIds,
    };
  });
  return approvalAndParticipantIds;
};
