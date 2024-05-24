import { RequestContext } from "@/common/middleware/context";

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}

export {};
