import { BaseServiceEvent, OperationContextUser } from "@/common/types";
import { UserRef } from "../types";

export class UserDeactivatedEvent extends BaseServiceEvent {
  constructor(public user: OperationContextUser, public userRef: UserRef) {
    super(user);
  }
}
