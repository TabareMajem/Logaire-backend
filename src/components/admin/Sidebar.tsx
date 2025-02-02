import { cn } from '@/lib/utils';
import {
    BarChart3,
    Bell,
    Bot,
    Boxes,
    Network,
    Settings,
    Shield,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const menuItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: BarChart3
  },
  {
    title: 'AI Agents',
    href: '/admin/agents',
    icon: Bot
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'Monitoring',
    href: '/admin/monitoring',
    icon: Network
  },
  {
    title: 'Alerts',
    href: '/admin/alerts',
    icon: Bell
  },
  {
    title: 'Integrations',
    href: '/admin/integrations',
    icon: Boxes
  },
  {
    title: 'Security',
    href: '/admin/security',
    icon: Shield
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

export function Sidebar() {
  const router = useRouter();

  return (
    <div className="w-64 border-r bg-background">
      <div className="flex flex-col h-screen">
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = router.pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
} 