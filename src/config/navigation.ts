import { NavItem } from '@/types/nav';
import { 
  LayoutDashboard, 
  Ship, 
  FileText, 
  Brain,
  Settings,
  Package,
  Calendar,
  Users,
  Activity
} from 'lucide-react';

export const dashboardNavItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    subject: 'dashboard'
  },
  {
    title: 'Shipments',
    href: '/dashboard/shipments',
    icon: Ship,
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
    icon: Brain,
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
    icon: FileText,
    subject: 'documents'
  },
  {
    title: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
    subject: 'calendar'
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: Users,
    subject: 'team'
  },
  {
    title: 'Activity',
    href: '/dashboard/activity',
    icon: Activity,
    subject: 'activity'
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    subject: 'settings'
  }
];