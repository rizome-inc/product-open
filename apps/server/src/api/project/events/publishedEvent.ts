import { BaseServiceEvent } from "@/common/types/events";
import { OperationContextUser, ProjectWithRelationships } from "@/common/types";

export class ProjectPublishedEvent extends BaseServiceEvent {
  constructor(user: OperationContextUser, public project: ProjectWithRelationships) {
    super(user);
  }
}
