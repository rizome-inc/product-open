import { BaseServiceEvent } from "@/common/types/events";
import { OperationContextUser } from "@/common/types";

export class DiscussionCommentMentionEvent extends BaseServiceEvent {
  constructor(
    user: OperationContextUser,
    public projectId: number,
    public discussionId: number,
    public discussionCommentId: number,
    public userIds: number[],
  ) {
    super(user);
  }
}
