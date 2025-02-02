import { HTTP_STATUS } from "@/config/constants";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, code = "BAD_REQUEST", details?: unknown) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, code, message, details);
  }

  static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, code, message);
  }

  static forbidden(message = "Forbidden", code = "FORBIDDEN") {
    return new ApiError(HTTP_STATUS.FORBIDDEN, code, message);
  }

  static notFound(message = "Not found", code = "NOT_FOUND") {
    return new ApiError(HTTP_STATUS.NOT_FOUND, code, message);
  }

  static internal(message = "Internal server error", code = "INTERNAL_ERROR") {
    return new ApiError(HTTP_STATUS.SERVER_ERROR, code, message);
  }
}