import { NextFunction, Request, RequestHandler, Response } from "express";
import createUserClient from "@/lib/supabase";
import { db } from "@/common/db";
import { OperationContextUser } from "@/common/types/operationContext";
import { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import { RizomeAccessToken, RizomeRefreshToken, authContract } from "xylem";

export type RequestContext = {
  supabase: SupabaseClient<any, "public", any>;
  // supabaseUser: SupabaseUser;
  user: OperationContextUser;
};

// We don't pull sessions / load the user for a public path
const PUBLIC_PATHS = [authContract.signup.path, authContract.confirm.path];

/**
 * Authentication context middleware
 * https://supabase.com/docs/reference/javascript/auth-getsession
 * `getSession` retrieves the current session. If it's expired, it uses the refresh token to fetch a new session automatically
 *
 * todo: better error handling around supabase auth failure
 *
 * Refer to apps/server/@/common/types/operationContext.ts for things we want to load from DB
 *
 * @param req
 * @param res
 * @param next
 */
export const contextMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // fixme: is there a better place for preflight handling?
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  // Don't add context for public paths
  if (PUBLIC_PATHS.find((path) => req.path.includes(path))) {
    next();
  } else {
    const supabase = createUserClient({ req, res });

    // todo: figure out lookup by xylem constant (req.headers[RizomeRefreshToken] is undefined; not sure what the lookup scheme is)
    const refreshToken = req.headers[RizomeRefreshToken]
      ? (req.headers[RizomeRefreshToken] as string)
      : undefined;
    const accessToken = req.headers[RizomeAccessToken]
      ? (req.headers[RizomeAccessToken] as string)
      : undefined;

    // console.log(`refresh: ${refreshToken} \n access: ${accessToken}`);

    if (refreshToken && accessToken) {
      // Set the session using cookies in the request. If the user exists in Supabase but the session expired, will create a new session
      const { data: sessionData, error } = await supabase.auth.setSession({
        refresh_token: refreshToken,
        access_token: accessToken,
      });
      if (error) {
        console.warn(
          `User attempted to visit path ${req.path} but was unauthorized. Supabase error: ${error}`,
        );
        return res.sendStatus(401);
      } else {
        const userResponse = await supabase.auth.getUser();
        // console.log(userResponse);
        const { user } = userResponse.data;
        // If Supabase can find this user, try to load them from the DB
        // If we can't load them, something is wrong and an engineer needs to look into it
        if (user && user.email) {
          try {
            const rizomeUser = await db.user.findFirstOrThrow({
              where: {
                email: user.email,
              },
              include: {
                organization: true,
              },
            });

            req.context = {
              supabase,
              user: rizomeUser,
            };

            // Add response headers with the access and refresh tokens in case those were reset when we set the session
            if (sessionData.session?.access_token) {
              res.setHeader(RizomeAccessToken, sessionData.session.access_token);
            }
            if (sessionData.session?.refresh_token) {
              res.setHeader(RizomeRefreshToken, sessionData.session.refresh_token);
            }
            next();
          } catch (e) {
            console.error(`Failed to find user with email ${user.email}`, JSON.stringify(e));
            return res.status(500).send("Failed to authenticate user. Please try again");
          }
        }
        // If Supabase couldn't find the user, it's unauthorized
        else {
          console.warn(
            `User attempted to visit path ${req.path} but was unauthorized. Supabase: {${userResponse.error}}`,
          );
          return res.sendStatus(401);
        }
      }
    } else {
      console.warn(
        `User attempted to visit path ${req.path} but was unauthorized - token not set: refresh: ${refreshToken} \n access: ${accessToken}`,
      );
      return res.sendStatus(401);
    }
  }
};
