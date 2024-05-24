import { BaseServiceEvent } from "@/common/types/events";
import { OperationContextUser } from "@/common/types";

export class DiscussionCompletedEvent extends BaseServiceEvent {
  constructor(user: OperationContextUser, public discussionId: number) {
    super(user);
  }
}
