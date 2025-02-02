// src/config/site.ts -->

import { NavItem } from '@/types/nav';
import { Icons } from '@/components/ui/icons';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Icons.layoutDashboard,
    subject: 'dashboard'
  },
  {
    title: 'Shipments',
    href: '/dashboard/shipments',
    icon: Icons.ship,
    subject: 'shipments',
    children: [
      { title: 'All Shipments', href: '/dashboard/shipments', subject: 'shipments' },
      { title: 'Create New', href: '/dashboard/shipments/new', subject: 'shipments' },
      { title: 'Reports', href: '/dashboard/shipments/reports', subject: 'shipments' }
    ]
  },
  {
    title: 'AI Agents',
    href: '/dashboard/ai-agents',
    icon: Icons.brain,
    subject: 'ai_agents',
    children: [
      { title: 'Overview', href: '/dashboard/ai-agents', subject: 'ai_agents' },
      { title: 'Performance', href: '/dashboard/ai-agents/performance', subject: 'ai_agents' },
      { title: 'Settings', href: '/dashboard/ai-agents/settings', subject: 'ai_agents' }
    ]
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: Icons.fileText,
    subject: 'documents'
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Icons.settings,
    subject: 'settings'
  }
];