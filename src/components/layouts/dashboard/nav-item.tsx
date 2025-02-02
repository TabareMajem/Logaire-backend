// src/components/layouts/dashboard/nav-item.tsx -->

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types/nav';
import { ChevronRight } from 'lucide-react';

interface NavItemProps {
  item: NavItem;
  level?: number;
}

export function NavItemComponent({ item, level = 0 }: NavItemProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
  const hasChildren = item.children && item.children.length > 0;
  const indent = level * 12;

  const Icon = item.icon ? item.icon : null;

  return (
    <div>
      <Link
        href={item.href}
        className={cn(
          "flex items-center px-3 py-2 text-sm rounded-md transition-colors relative",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-accent hover:text-accent-foreground",
          item.disabled && "pointer-events-none opacity-60"
        )}
        style={{ paddingLeft: `${indent + 12}px` }}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        <span>{item.title}</span>
        {hasChildren && (
          <ChevronRight className={cn(
            "ml-auto h-4 w-4 transition-transform",
            expanded && "rotate-90"
          )} />
        )}
      </Link>

      {hasChildren && expanded && (
        <div className="mt-1">
          {/* {item.children.map((child) => (
            <NavItemComponent 
              key={child.href} 
              item={child} 
              level={level + 1} 
            />
          ))} */}

          {item.children?.map((child) => ( // Optional chaining here
            <NavItemComponent 
              key={child.href} 
              item={child} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}