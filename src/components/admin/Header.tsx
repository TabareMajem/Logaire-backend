// src/components/admin/Header.tsx -->

import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { AuthUser } from '@supabase/supabase-js';

interface UserWithMetadata extends AuthUser {
  user_metadata: {
    name?: string;
    image?: string;
  }
}

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </div>

        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as UserWithMetadata)?.user_metadata?.image} alt={(user as UserWithMetadata)?.user_metadata?.name || ''} />
                  <AvatarFallback>
                    {(user as UserWithMetadata)?.user_metadata?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 