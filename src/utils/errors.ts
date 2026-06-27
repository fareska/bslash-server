import { HttpStatus, HttpMessages } from "../constants/http.js";
import { ErrorMessages } from "../constants/messages.js";

export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL = "INTERNAL_SERVER_ERROR",
}

export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: ErrorCode,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnknownFilterError extends AppError {
  constructor(readonly unknown: string[], readonly available: string[]) {
    super(
      ErrorMessages.unknownFilters(unknown, available),
      HttpStatus.BAD_REQUEST,
      ErrorCode.BAD_REQUEST,
    );
    this.name = "UnknownFilterError";
  }
}

export const AppErrors = {
  notFound: () => new AppError(HttpMessages.NOT_FOUND, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND),
  internal: () =>
    new AppError(
      HttpMessages.INTERNAL_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL,
    ),
};
