"use client";

import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export type ActivityType = 'shipment' | 'booking' | 'document' | 'system';

export interface Activity {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export async function fetchActivityFeed(limit = 20): Promise<Activity[]> {
  try {
    
    const { data, error } = await supabase
      .from('activities')
      .select(`
        id,
        type,
        action,
        description,
        metadata,
        created_at,
        user:users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // return data.map(activity => ({
    //   ...activity,
    //   user: activity.user ? {
    //     id: activity.user.id,
    //     name: `${activity.user.first_name} ${activity.user.last_name}`.trim(),
    //     avatar_url: activity.user.avatar_url,
    //   } : undefined,
    // }));
    return data.map(activity => ({
      ...activity,
      user: activity.user && activity.user.length > 0 ? {
        id: activity.user[0].id, // Access the first user object if it's an array
        name: `${activity.user[0].first_name} ${activity.user[0].last_name}`.trim(),
        avatar_url: activity.user[0].avatar_url,
      } : undefined,
    }));
  } catch (error) {
    ErrorLogger.error('Failed to fetch activity feed', error as Error);
    throw error;
  }
}