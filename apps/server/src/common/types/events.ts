import { OperationContextUser } from "./operationContext";

export class BaseServiceEvent {
  constructor(public user: OperationContextUser) {}
}
