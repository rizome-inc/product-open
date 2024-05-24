import { SxProps, Theme } from "@mui/material/styles";
import moment, { MomentInput } from "moment";
import { ContributorRole, ContributorSchema, UserSchema } from "xylem";

export const prettifyJsonString = (jsonString: string) => {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, "\t");
  } catch (error) {
    return jsonString;
  }
};

export const minifyJsonString = (jsonString: string) => {
  try {
    return JSON.stringify(JSON.parse(jsonString), null);
  } catch (error) {
    return jsonString;
  }
};

export const getStringValueForError = (error: any): string | string[] | null => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    (error instanceof Error || error.hasOwnProperty("message")) &&
    typeof (error as { message: string }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  if (Array.isArray(error) && error.every((x) => typeof x === "string")) {
    return error;
  }

  return null;
};

export const getTimeDiffText = (dateTimeAsString?: MomentInput) => {
  if (!dateTimeAsString) {
    return "";
  }
  const updatedAtMoment = moment(dateTimeAsString);
  const nowMoment = moment();
  const minutes = nowMoment.diff(updatedAtMoment, "minute");
  const hours = nowMoment.diff(updatedAtMoment, "hour");
  const days = nowMoment.diff(updatedAtMoment, "day");
  const weeks = nowMoment.diff(updatedAtMoment, "week");
  const months = nowMoment.diff(updatedAtMoment, "month");

  if (minutes < 1) {
    return `just now`;
  }

  if (hours < 1) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  if (days < 1) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (weeks < 2) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  if (months < 1) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  return `${months} month${months > 1 ? "s" : ""} ago`;
};

export const mergeSxStyles = (...args: (SxProps<Theme> | undefined)[]): SxProps<Theme> => {
  if (args && args.length > 0) {
    let result: SxProps<Theme> = [];
    args.forEach((x) => {
      if (x) {
        result = [...(result as []), ...(Array.isArray(x) ? x : [x])];
      }
    });
    return result;
  }
  return [];
};

export const getEntityDisplayName = (entity?: Partial<UserSchema> | null | undefined) => {
  if (entity?.firstName && entity?.lastName) {
    return `${entity.firstName} ${entity.lastName}`;
  }

  return entity?.email || "";
};

const allContributorRoles = Object.values(ContributorRole);

export type BucketedContributors = Record<
  (typeof allContributorRoles)[number],
  (ContributorSchema | null)[]
>;

export function bucketContributors(contributors?: ContributorSchema[] | undefined | null) {
  return allContributorRoles.reduce<BucketedContributors>((res, x) => {
    res[x] = contributors?.filter((y) => y.role === x) || [];
    return res;
  }, {} as BucketedContributors);
}

export async function copyToClipboard(text: string) {
  if (navigator?.permissions?.query) {
    try {
      const result = await navigator.permissions.query({ name: "write-on-clipboard" as any });
      if (result.state === "denied") {
        return false;
      }
    } catch (error) {}
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    return false;
  }
  return true;
}

export function openUrlInNewTab(url: string) {
  window?.open(url, "_blank");
}
