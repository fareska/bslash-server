export const HttpStatus = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const HttpMessages = {
  NOT_FOUND: "Not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
} as const;
