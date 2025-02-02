"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface User {
  id: string;
  name: string;
  avatar_url?: string;
}

async function fetchUsers(): Promise<User[]> {
  
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, avatar_url');

  if (error) throw error;

  return data.map(user => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
    avatar_url: user.avatar_url
  }));
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
}