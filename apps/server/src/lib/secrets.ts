import dotenv from "dotenv";

dotenv.config();

export const isProduction = process.env.NODE_ENV === "production";

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error("SUPABASE_URL not defined");
}
export const SUPABASE_URL = supabaseUrl;

const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY not defined");
}
export const SUPABASE_ANON_KEY = supabaseAnonKey;

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY not defined");
}
export const SUPABASE_SERVICE_ROLE_KEY = supabaseServiceRoleKey;

const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (!sendgridApiKey) {
  throw new Error("SENDGRID_API_KEY not defined");
}
export const SENDGRID_API_KEY = sendgridApiKey;

const appUrl = process.env.APP_URL;
if (!appUrl) {
  throw new Error("APP_URL not defined");
}
export const APP_URL = appUrl;

const liveblocksSecretKey = process.env.LIVEBLOCKS_SECRET_KEY;
if (!liveblocksSecretKey) {
  throw new Error("LIVEBLOCKS_SECRET_KEY not defined");
}
export const LIVEBLOCKS_SECRET_KEY = liveblocksSecretKey;

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY not defined");
}
export const OPENAI_API_KEY = openaiApiKey;

const liveblocksWebhookSecretKey = process.env.LIVEBLOCKS_WEBHOOK_SECRET_KEY;
if (!liveblocksWebhookSecretKey) {
  throw new Error("LIVEBLOCKS_WEBHOOK_SECRET_KEY not defined");
}
export const LIVEBLOCKS_WEBHOOK_SECRET_KEY = liveblocksWebhookSecretKey;
