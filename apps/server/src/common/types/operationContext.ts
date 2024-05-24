import { Organization, User } from "@prisma/client";

// see lib/user.ts for helper functions
export type OperationContextUser = User & {
  organization: Organization | null;
};
