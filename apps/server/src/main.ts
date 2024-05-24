import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { contextMiddleware } from "./common/middleware/context";
import supportRouter from "./api/support/supportRouter";
import projectTemplateRouter from "./api/projectTemplate/projectTemplateRouter";
import projectRouter from "./api/project/projectRouter";
import discussionsRouter from "./api/discussion/discussionsRouter";
import userRouter from "./api/user/userRouter";
import http from "http";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { jointContract } from "xylem";
import authRouter from "./api/auth/authRouter";
import feedbackRouter from "./api/feedback/feedbackRouter";
import { WebhookEvent, WebhookHandler } from "@liveblocks/node";
import { LIVEBLOCKS_WEBHOOK_SECRET_KEY } from "./lib/secrets";
import { syncProject } from "./api/project/liveblocksSync";

dotenv.config();

const corsOrigin = process.env.ALLOWED_ORIGINS?.split(",") || ["https://app.rizo.me"];
console.log("CORS Origins: ", corsOrigin);

const app = express();
// Middleware

// todo: consider invoking middleware with ts-rest to get typing in req: https://ts-rest.com/docs/express/middleware
app.use(compression());
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.use(cookieParser());

// ts-rest server
const server = initServer();
const router = server.router(jointContract, {
  auth: authRouter,
  feedback: feedbackRouter,
  support: supportRouter,
  template: projectTemplateRouter,
  user: userRouter,
  project: projectRouter,
  discussion: discussionsRouter,
});
createExpressEndpoints(jointContract, router, app, {
  globalMiddleware: [contextMiddleware],
  jsonQuery: true,
});

// Deployment healthcheck
app.get("/health", (_, res) => res.sendStatus(200));

// Liveblocks webhook sync
const liveblocksWebhookHandler = new WebhookHandler(LIVEBLOCKS_WEBHOOK_SECRET_KEY);
app.post("/liveblocks-database-sync", async (req, res) => {
  // Verify if this is a real webhook request
  let event: WebhookEvent;
  try {
    event = liveblocksWebhookHandler.verifyRequest({
      headers: req.headers,
      rawBody: JSON.stringify(req.body),
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json("Could not verify webhook call");
  }

  // todo: figure out what kind of error verifyRequest throws and handle this all in one block
  try {
    await syncProject(event);
    return res.sendStatus(200);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
    return res.status(500).json("Encountered unexpected error");
  }
});

// Required abstraction for socket.io. Removed in 3.24 in lieu of liveblocks
const httpServer = http.createServer(app);

httpServer.listen(process.env.PORT || 4000, () => {
  console.log(`[v2 server]: Server is running at http://localhost:${process.env.PORT}`);
});
