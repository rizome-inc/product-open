import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  isProduction,
} from "./secrets";
import { createClient } from "@supabase/supabase-js";

// https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=express&environment=server-client

const createUserClient = (context) => {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    cookies: {
      get: (key) => {
        const cookies = context.req.cookies;
        const cookie = cookies[key] ?? "";
        return decodeURIComponent(cookie);
      },
      set: (key, value, options) => {
        if (!context.res) return;
        context.res.cookie(key, encodeURIComponent(value), {
          ...options,
          sameSite: "Lax",
          httpOnly: true,
          secure: !isProduction,
          // todo: set expiration?
        });
      },
      remove: (key, options) => {
        if (!context.res) return;
        context.res.cookie(key, "", { ...options, httpOnly: true });
      },
    },
  });
};

// https://supabase.com/docs/reference/javascript/admin-api
export const createAdminClient = () =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

export default createUserClient;
