// src/app/layout.tsx -->

// import { Suspense } from 'react';
// import { AppProvider } from '@/providers/app-provider';
// import { AuthProvider } from '@/providers/auth-provider';
// import { RealtimeProvider } from '@/providers/realtime-provider';
// import '@/app/global.css';

// function LoadingFallback() {
//   console.log("Rendering loading fallback"); // Debug log
//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="animate-pulse">Loading...</div>
//     </div>
//   );
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   console.log("Rendering root layout"); // Debug log
  
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <title>FreightFlow</title>
//       </head>
//       <body>
//         <Suspense fallback={<LoadingFallback />}>
//           <AuthProvider>
//             <AppProvider>
//               <RealtimeProvider>
//                 {children}
//               </RealtimeProvider>
//             </AppProvider>
//           </AuthProvider>
//         </Suspense>
//       </body>
//     </html>
//   );
// }




import { AppProvider } from '@/providers/app-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { RealtimeProvider } from '@/providers/realtime-provider';
// import '@/styles/globals.css';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <AppProvider>
            <RealtimeProvider>
              {children}
            </RealtimeProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}