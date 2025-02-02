// src/components/layout/dashboard/nav-items.ts -->

import { NavItem } from '@/types/nav';
import { Icons } from '@/components/ui/icons';


export const dashboardNavItems: NavItem[] = [
  {
    title: 'Overview',
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
    title: 'Carriers',
    href: '/dashboard/carriers',
    icon: Icons.truck,
    subject: 'carriers',
    children: [
      { title: 'Overview', href: '/dashboard/carriers', subject: 'carriers' },
      { title: 'Performance', href: '/dashboard/carriers/performance', subject: 'carriers' },
      { title: 'Integration', href: '/dashboard/carriers/integration', subject: 'carriers' }
    ]
  },
  {
    title: 'Integrations',
    href: '/dashboard/integrations',
    icon: Icons.plug,
    subject: 'integrations'
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Icons.settings,
    subject: 'settings'
  }
];