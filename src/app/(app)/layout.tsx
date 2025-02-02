// // src/app/(app)/layout.tsx

// "use client";

// import { useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { useAuth } from '@/hooks/use-auth';
// import { LoadingPage } from '@/components/ui/loading';
// import { AdminLayout } from '@/components/layouts/admin-layout';
// import { DashboardLayout } from '@/components/layouts/dashboard-layout';

// export default function AppLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { isAuthenticated, isLoading, user } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (!isLoading) {
//       if (!isAuthenticated) {
//         router.push('/auth/login');
//         return;
//       }

//       // Redirect non-admin users from admin routes
//       if (pathname.startsWith('/app/admin') && user?.user_metadata?.role !== 'admin') {
//         router.push('/app/dashboard');
//       }
//     }
//   }, [isLoading, isAuthenticated, user, pathname, router]);

//   // Show loading state
//   if (isLoading) {
//     return <LoadingPage />;
//   }

//   // Don't render anything while redirecting to login
//   if (!isAuthenticated) {
//     return null;
//   }

//   // Use appropriate layout based on route
//   const Layout = pathname.startsWith('/app/admin') ? AdminLayout : DashboardLayout;

//   return <Layout>{children}</Layout>;
// }


// // src/app/(app)/layout.tsx

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoadingPage } from "@/components/ui/loading";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login immediately when unauthenticated
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && pathname?.startsWith("/app/admin")) {
      if (user?.user_metadata?.role !== "admin") {
        // Redirect non-admin users immediately
        router.replace("/app/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const Layout = pathname?.startsWith("/app/admin") ? AdminLayout : DashboardLayout;

  return <Layout>{children}</Layout>;
}
