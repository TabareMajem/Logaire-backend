// src/types/nav.ts -->

import { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  subject: string;
  disabled?: boolean;
  external?: boolean;
  children?: Omit<NavItem, 'icon' | 'children'>[];
}

export interface NavItemWithChildren extends NavItem {
  children: NavItem[];
}
