// src/lib/api/middleware/auth.ts -->

import { createMiddleware } from "@/lib/api/middleware";
import { ApiError } from "@/lib/api/errors";
import { supabase } from "@/lib/supabase/client";

export const withAuth = createMiddleware(async (request) => {
  
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw ApiError.unauthorized();
  }

  return { session };
});