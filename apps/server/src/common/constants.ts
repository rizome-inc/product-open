export const RequestIdHeaderKey = "X-Request-Id";

export const getAllowedOrigins = () => {
  return process.env.ALLOWED_ORIGINS?.split(",") || ["https://app.rizo.me"];
};

export enum EnvironmentVariableKeys {
  AppUrl = "APP_URL",
  ThumbnailSize = "THUMBNAIL_SIZE",
}

export enum ScheduledTaskNames {
  DailyEmailNotifications = "DailyEmailNotifications",
  WeeklyEmailNotifications = "WeeklyEmailNotifications",
}
