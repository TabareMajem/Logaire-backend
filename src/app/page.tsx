// // src/app/page.tsx -->

// "use client";

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase/client'; // Assuming this is where your Supabase client is set up

// export default function RootPage() {
//   const router = useRouter();

//   useEffect(() => {
//     const session = supabase.auth.getSession();

//     if (!session) {
//       // If there's no session, redirect to the login page
//       router.push('/auth/login');
//     } 
//     else {
//       router.push('/dashboard');
//     }
//   }, [router]);

//   return (
//     <div>
//       {/* Any content or loading state goes here */}
//     </div>
//   );
// }

// src/app/page.tsx -->

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function RootPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const path = session ? '/dashboard' : '/auth/login';
        router.push(path);
      } catch (error) {
        console.error('Session check error:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return null;
}

// // src/app/page.tsx -->

// "use client";

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/hooks/use-auth'; // Use the same auth hook you're using in AppLayout

// export default function RootPage() {
//   const router = useRouter();
//   const { isAuthenticated, isLoading } = useAuth();

//   useEffect(() => {
//     // If not loading and not authenticated, redirect to login
//     if (!isLoading && !isAuthenticated) {
//       router.replace('/auth/login');
//     } else if (!isLoading && isAuthenticated) {
//       // If authenticated, redirect to dashboard
//       router.replace('/app/dashboard');
//     }
//   }, [isLoading, isAuthenticated, router]);

//   // Return null or a loading state while redirecting
//   return null;
// }