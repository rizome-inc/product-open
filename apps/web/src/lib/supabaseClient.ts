import { Session, createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";
import { FileAttachmentSchema } from "xylem";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) throw new Error("No supabase url defined");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseAnonKey) throw new Error("No supabase anon key defined");

const BUCKET_NAME = "attachments";

/**
 * IMPORTANT: do not use the ssr package here because it breaks the auth flow for our non-ssr setup
 */
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
  },
});

// todo: still needed
export const sessionIsExpired = (session: Session | null): boolean => {
  if (!session || !session.expires_at) return true;
  return dayjs(session.expires_at * 1000).isBefore(dayjs());
};

// fixme: correct error handling for failed file uploads
export const uploadFile = async (file: File, fileAttachmentSchema: FileAttachmentSchema) => {
  const { path, uploadAuthToken } = fileAttachmentSchema;
  if (uploadAuthToken) {
    const { data, error } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .uploadToSignedUrl(path, uploadAuthToken, file);
    if (error) {
      console.error("Error uploading file", error);
      throw new Error("Error uploading file");
    }
    console.log("uploaded file", data);
  } else {
    throw new Error("Cannot upload file. Not authenticated");
  }
};

export default supabaseClient;
