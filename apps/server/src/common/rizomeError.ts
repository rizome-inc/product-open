/**
 * Simple error class to track information relevant for API errors.
 * Designed as a replacement for NestJS error classes.
 */

export enum ErrorName {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  PayloadTooLarge = 413,
  UnsupportedMediaType = 415,
  InternalServerError = 500,
}

class RizomeError extends Error {
  errorName: ErrorName;
  code: number;
  message: string;
  source: "socket" | "web";
  error?: Error;

  constructor(
    errorName: ErrorName,
    message: string,
    source: "socket" | "web" = "web",
    error?: Error,
  ) {
    super();
    this.errorName = errorName;
    this.code = errorName.valueOf();
    this.message = message;
    this.source = source;
    this.error = error;
  }
}

export const isRizomeError = (e: unknown): e is RizomeError =>
  (e as RizomeError).source !== undefined;

export default RizomeError;
