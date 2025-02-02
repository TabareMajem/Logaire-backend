import { ApiError } from "./errors";
import { HTTP_STATUS } from "@/config/constants";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta?: ApiResponse["meta"]): Response {
    return Response.json({ data, meta }, { status: HTTP_STATUS.OK });
  }

  static created<T>(data: T): Response {
    return Response.json({ data }, { status: HTTP_STATUS.CREATED });
  }

  static error(error: ApiError): Response {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }
}