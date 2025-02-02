done done done

export * from './auth';
export * from './logging';
export * from './metrics';
export * from './rate-limit';

export function createMiddleware(middleware: Middleware) {
  return async (request: Request, context: Context = {}): Promise<Response> => {
    try {
      const result = await middleware(request, {
        ...context,
        next: async () => {
          // Chain to next middleware or handle request
          return context.next ? await context.next() : new Response();
        }
      });

      return result instanceof Response ? result : new Response();
    } catch (error) {
      if (error instanceof ExternalAPIError) {
        return new Response(JSON.stringify({
          error: {
            code: error.code,
            message: error.message
          }
        }), {
          status: error.statusCode,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  };
}

export interface Context {
  client?: string;
  next?: () => Promise<Response>;
  [key: string]: any;
}

export type Middleware = (
  request: Request,
  context: Context
) => Promise<Response | void>;