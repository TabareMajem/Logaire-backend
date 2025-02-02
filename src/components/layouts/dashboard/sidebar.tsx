// // src/components/layouts/dashboard/sidebar.tsx

"use client";

// src/components/layouts/dashboard/sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { navItems } from '@/config/site';
import { cn } from '@/lib/utils';
import { Ship } from 'lucide-react';
import React from 'react';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Ship className="h-6 w-6" />
          <span className="font-bold">FreightFlow</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {Icon && (
                  <span className="mr-3">
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}

// "use client";

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { ScrollArea } from '../../../../components/ui/scroll-area';
// import { navItems } from '@/config/site';
// import { cn } from '@/lib/utils';
// import { Ship } from 'lucide-react';
// import React from 'react';

// export function Sidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="w-64 border-r bg-card">
//       <div className="h-16 flex items-center px-6 border-b">
//         <Link href="/dashboard" className="flex items-center space-x-2">
//           <Ship className="h-6 w-6" />
//           <span className="font-bold">FreightFlow</span>
//         </Link>
//       </div>
      
//       <ScrollArea className="flex-1 py-4">
//         <nav className="space-y-1 px-2">
//           {navItems.map((item) => (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={cn(
//                 "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
//                 pathname === item.href 
//                   ? "bg-primary text-primary-foreground" 
//                   : "hover:bg-accent hover:text-accent-foreground"
//               )}
//             >
//               {/* {item.icon && (
//                 <span className="mr-3">{item.icon}</span>
//               )} */}
//               {item.icon && (
//                 <span className="mr-3">
//                   {typeof item.icon === 'symbol' ? null : item.icon as unknown as React.ReactNode}
//                 </span>
//               )}
//               {item.title}
//             </Link>
//           ))}
//         </nav>
//       </ScrollArea>
//     </aside>
//   );
// }