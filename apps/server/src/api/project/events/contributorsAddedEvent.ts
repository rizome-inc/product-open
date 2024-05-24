import { OperationContextUser } from "@/common/types";
import { BaseServiceEvent } from "@/common/types/events";
import { ContributorRole, Contributor } from "@prisma/client";

export class ProjectContributorsAddedEvent extends BaseServiceEvent {
  constructor(
    user: OperationContextUser,
    public projectId: number,
    public contributors: (Omit<Partial<Contributor>, "userId" | "role" | "projectId"> & {
      role: ContributorRole;
      userId: number;
    })[],
  ) {
    super(user);
  }
}
