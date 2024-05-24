import { initContract } from '@ts-rest/core';
import { feedbackContract } from './contracts/feedback';
import { authContract } from './contracts/auth';
import { supportContract } from './contracts/support';
import { templateContract } from './contracts/projectTemplate';
import { userContract } from './contracts/user';
import { projectContract } from './contracts/project';
import { discussionContract } from './jointContract';
import { z } from "zod";

export * from "./contracts/auth";
export * from "./contracts/common";
export * from "./contracts/discussion";
export * from "./contracts/feedback";
export * from "./contracts/project";
export * from "./contracts/projectTemplate";
export * from "./contracts/support";
export * from "./contracts/user";

const c = initContract();

// The ts-rest vernacular is a little odd, but a "router" here really just defines a contract.
// When we use it in main.ts, we actually implement that contract
export const jointContract = c.router({
  auth: authContract,
  feedback: feedbackContract,
  support: supportContract,
  template: templateContract,
  user: userContract,
  project: projectContract,
  discussion: discussionContract,
}, 
// fixme: figure out how to get base headers working without blowing up server typing
// {
//   baseHeaders: z.object({
//     rizomeaccesstoken: z.string().optional(),
//     rizomerefreshtoken: z.string().optional()
//   })
// }
);