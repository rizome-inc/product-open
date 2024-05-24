import supabaseClient from "@/lib/supabaseClient";
import { useGetCurrentUserQuery } from "@/queries";
import {
  AuthChangeEvent,
  EmailOtpType,
  Session,
  VerifyTokenHashParams,
} from "@supabase/supabase-js";
import { useRouter } from "next/router";
import * as React from "react";
import { UserRole, UserSchema } from "xylem";
import { useContextGuard } from "./contextGuard";

const PUBLIC_ROUTES = ["/signin", "/signup"];
export const ACCESS_TOKEN_COOKIE_NAME = "rizome-access-token";
export const REFRESH_TOKEN_COOKIE_NAME = "rizome-refresh-token";

// fixme: Specify authenticated vs unauthenticated page layouts instead of this weird provider load logic?
// todo: determine whether pendo access is a good reason to have this provider be a parent of the layout
export function useUserSessionContextController() {
  const [session, setSession] = React.useState<Session | null>(null);
  const router = useRouter();

  /**
   * Subscribe to auth events & create / delete cookies for initial server authentication
   */
  React.useEffect(() => {
    // todo: make more constants; determine if I want to set the session consistently
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      switch (true) {
        case event === "INITIAL_SESSION": {
          setSession(session);
          break;
        }
        case event === "SIGNED_OUT": {
          setSession(session);
          // delete cookies on sign out
          const expires = new Date(0).toUTCString();
          document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; path=/; expires=${expires}; SameSite=Lax; secure`;
          document.cookie = `${REFRESH_TOKEN_COOKIE_NAME}=; path=/; expires=${expires}; SameSite=Lax; secure`;
          router.push("/signin");
          break;
        }
        case ["SIGNED_IN", "TOKEN_REFRESHED"].includes(event) && Boolean(session): {
          setSession(session);
          const maxAgeAccess = 24 * 60 * 60; // 24 hours
          const maxAgeRefresh = 7 * 24 * 60 * 60; // 7 days
          document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${
            session!.access_token
          }; path=/; max-age=${maxAgeAccess}; SameSite=Lax; secure`;
          document.cookie = `${REFRESH_TOKEN_COOKIE_NAME}=${
            session!.refresh_token
          }; path=/; max-age=${maxAgeRefresh}; SameSite=Lax; secure`;
          break;
        }
        default:
          break;
      }
    });
    return () => subscription.unsubscribe();
  }, []); // should run once

  React.useEffect(() => {
    // const next = Array.isArray(token["next"]) ? token["next"][0] : token["next"];
    // fixme: make a toast upon error
    const authenticate = async (type: string, token_hash: string) => {
      const castType: EmailOtpType = type as EmailOtpType;
      const verificationParams: VerifyTokenHashParams = {
        type: castType,
        token_hash,
      };
      const { data, error } = await supabaseClient.auth.verifyOtp(verificationParams);
      // todo: these cookies are getting set once here and once in the userSession's supabase auth listener.
      //       Figure out a better way to guarantee they'll be set in time to call the server
      if (error || !data.session) {
        console.error("sign in error", error, session);
        router.push("/signin");
      } else {
        const maxAgeAccess = 24 * 60 * 60; // 24 hours
        const maxAgeRefresh = 7 * 24 * 60 * 60; // 7 days
        document.cookie = `rizome-access-token=${data.session.access_token}; path=/; max-age=${maxAgeAccess}; SameSite=Lax; secure`;
        document.cookie = `rizome-refresh-token=${data.session.refresh_token}; path=/; max-age=${maxAgeRefresh}; SameSite=Lax; secure`;
      }
    };

    if (router.isReady) {
      if (router.query["token_hash"] && router.query["type"]) {
        const token_hash = Array.isArray(router.query["token_hash"])
          ? router.query["token_hash"][0]
          : router.query["token_hash"];
        const type = Array.isArray(router.query["type"])
          ? router.query["type"][0]
          : router.query["type"];
        authenticate(type, token_hash);
      } else if (PUBLIC_ROUTES.includes(router.pathname)) {
        // don't do anything
      } else {
        // Non-magic link, non-signed in path
        supabaseClient.auth.getSession().then((s) => {
          if (!s.data.session && router.pathname !== "/signin") {
            router.push("/signin");
          }
        });
      }
    }
  }, [router.isReady]);

  /**
   * On window focus, check if the session is still valid by fetching the user from the Supabase auth db. If not, sign out the user.
   * getUser() triggers a SIGNED_IN AuthChangeEvent and thus re-sets session state & cookies
   */
  React.useEffect(() => {
    const onWindowFocus = async () => {
      if (session) {
        await supabaseClient.auth.getUser();
      } else {
        await supabaseClient.auth.signOut();
      }
    };
    window.addEventListener("focus", onWindowFocus);
    return () => {
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [session]);

  const signOut = () => supabaseClient.auth.signOut();

  const {
    data: user,
    isLoading: isLoadingUser,
    status: userLoadStatus,
  } = useGetCurrentUserQuery({
    enabled: Boolean(session), // don't try to fetch the user unless there's a session
    refetchOnWindowFocus: false,
  });

  const isAdmin: boolean = [UserRole.Admin, UserRole.SuperAdmin].some(
    (x) => user?.roles?.some((y) => y === x),
  );

  return {
    ...React.useMemo(
      () => ({
        failedToLoadUser: userLoadStatus === "error",
        isAdmin,
        isLoadingUser: isLoadingUser,
        userLoadStatus,
        user,
        session,
        setSession,
        signOut,
      }),
      [userLoadStatus, isLoadingUser, user, session],
    ),
  };
}

export type UserSessionContext = ReturnType<typeof useUserSessionContextController>;

export const UserSessionContext = React.createContext<UserSessionContext>({} as any);

export function UserSessionContextProvider({
  children,
}: React.PropsWithChildren<{ initialValue?: UserSchema }>) {
  const ctx = useUserSessionContextController();
  return <UserSessionContext.Provider value={ctx}>{children}</UserSessionContext.Provider>;
}

export const useUserSessionContext = () =>
  useContextGuard(UserSessionContext, "UserSessionContext");
