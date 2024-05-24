import { BaseServiceEvent, OperationContextUser } from "@/common/types";
import { UserRef } from "../types";

export class UserInvitedEvent extends BaseServiceEvent {
  constructor(public user: OperationContextUser, public users: UserRef[] | UserRef) {
    super(user);
  }
}
