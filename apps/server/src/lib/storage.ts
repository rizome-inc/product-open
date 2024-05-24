import { db } from "@/common/db";
import { createAdminClient } from "./supabase";
import { v4 as uuidgen } from "uuid";
import { FileAttachmentSchema } from "xylem";
import { decode } from "base64-arraybuffer";

const BUCKET_NAME = "attachments";
const PUBLIC_BUCKET_NAME = "static";

export const SIGNED_URL_EXPIRES_IN = 24 * 60 * 60;

export type FilePathComponent = { id: number; directory: string };
/**
 * Forms an S3 bucket path given a directory order & a file name
 * Prefixes a hyphen and string/uuid to the file name to avoid instances of same-name file conflicts
 *
 * @param components An in-order array of directory names and ids
 * @param fileName
 * @param newId prefixed identifier to prevent naming conflicts. If not provided, a uuid will be generated
 */
export const createFilePath = (
  components: FilePathComponent[],
  fileName: string,
  newId: string,
): string => {
  const directoryPath = components.reduce(
    (acc, { directory, id }) => `${acc}/${directory}-${id}`,
    "",
  );
  return `${directoryPath}/${newId}-${fileName}`;
};

/**
 *
 * @param components
 * @param fileName
 * @returns
 * @throws
 */
export const generateSignedAttachmentUploadUrl = async (
  components: FilePathComponent[],
  fileName: string,
): Promise<FileAttachmentSchema> => {
  const supabaseAdminClient = createAdminClient();
  const attachmentId = uuidgen();
  const { data, error } = await supabaseAdminClient.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(createFilePath(components, fileName, attachmentId));
  if (error) {
    console.error("Failed to get signed upload url", error);
    throw new Error("Failed to get signed upload url");
  }
  return {
    id: attachmentId,
    path: data.path,
    fileName,
    uploadAuthToken: data.token,
    uploadUrl: data.signedUrl,
  };
};

/**
 * Generates signed url that allow clients to view / download attachments
 *
 * dev note: Supabase SDK was throwing errors for batched url generation so this runs for one path
 *
 * @param path
 * @returns
 */
export const generateSignedAttachmentUrl = async (path: string): Promise<string> => {
  const supabaseAdminClient = createAdminClient();
  const { data, error } = await supabaseAdminClient.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);
  if (error) {
    console.error(error);
    throw new Error("Failed to create signed urls for path");
  }
  return data.signedUrl;
};

/**
 * Deletes a file attachment in our DB and in Supabase
 *
 * @param uuid file_attachments record identifier
 */
export const deleteFileAttachment = async (uuid: string) => {
  const supabaseAdminClient = createAdminClient();
  const { path } = await db.fileAttachment.findFirstOrThrow({
    select: {
      path: true,
    },
    where: {
      uuid,
    },
  });
  const { error } = await supabaseAdminClient.storage.from(BUCKET_NAME).remove([path]);
  if (error) {
    console.error(error);
    throw new Error("Failed to delete attachment in storage provider");
  }
  await db.fileAttachment.delete({
    where: {
      uuid,
    },
  });
};

export const uploadProjectImageFromBase64 = async ({
  projectId,
  organizationId,
  fileBase64,
}: {
  projectId: number;
  organizationId: number;
  fileBase64: string;
}) => {
  const filePathComponents: FilePathComponent[] = [
    {
      directory: "organization",
      id: organizationId,
    },
    {
      directory: "project",
      id: projectId,
    },
  ];
  const attachmentId = uuidgen();
  const fileName = `dalleImage.png`;
  const filePath = createFilePath(filePathComponents, fileName, attachmentId);

  const supabaseAdminClient = createAdminClient();
  const { data, error } = await supabaseAdminClient.storage
    .from(BUCKET_NAME)
    .upload(filePath, decode(fileBase64), {
      contentType: "image/png",
    });

  if (error) {
    console.error(error);
    throw new Error("Failed to upload DALL-E image to Supabase");
  }

  return data.path;
};
