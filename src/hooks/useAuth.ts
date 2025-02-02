// src/hooks/useAuth.ts -->

import { User } from '@/types/auth';  // Import the new type
import { supabase } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setUser(currentSession?.user as User || null);
      setSession(currentSession);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setUser(currentSession?.user as User || null);
      setSession(currentSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    user,
    session,
    isLoading,
    isAdmin: user?.role === 'admin',
    signOut
  };
}

// import { supabase } from "@/lib/supabase/client";
// import { AuthUser, Session } from "@supabase/supabase-js";
// import { useCallback, useEffect, useState } from "react";

// export function useAuth() {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [session, setSession] = useState<Session | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Get initial session
//     supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
//       setUser(currentSession?.user as AuthUser || null);
//       setSession(currentSession);
//       setIsLoading(false);
//     });

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
//       setUser(currentSession?.user as AuthUser || null);
//       setSession(currentSession);
//       setIsLoading(false);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const signOut = useCallback(async () => {
//     await supabase.auth.signOut();
//   }, []);

//   return {
//     user,
//     session,
//     isLoading,
//     isAdmin: user?.role === 'admin',
//     signOut
//   };
// }