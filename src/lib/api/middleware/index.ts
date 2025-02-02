import { ApiError } from "@/lib/api/errors";
import { NextRequest } from "next/server";

type MiddlewareContext = Record<string, unknown>;
type MiddlewareFunction = (
  request: NextRequest,
  context?: MiddlewareContext
) => Promise<MiddlewareContext>;

export function createMiddleware(middleware: MiddlewareFunction) {
  return async (
    request: NextRequest,
    context: MiddlewareContext = {}
  ): Promise<MiddlewareContext> => {
    try {
      return await middleware(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal();
    }
  };
}