"use client";

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useActivityFeed } from '@/hooks/use-activity-feed';
import { ActivityType } from '@/lib/api/activity';
import { ActivityFilter } from './activity-filter';
import { ActivityTypeIcon } from './activity-type-icon';
import { ActivityMetadata } from './activity-metadata';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Icons } from '@/components/ui/icons';

function getInitials(name?: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start space-x-4 animate-pulse">
      <div className="rounded-full bg-muted h-10 w-10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const { data: activities, isLoading, error } = useActivityFeed(20);

  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    return filter === 'all' 
      ? activities 
      : activities.filter(a => a.type === filter);
  }, [activities, filter]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Icons.alertTriangle className="h-6 w-6 mx-auto mb-2" />
          <p>Failed to load activity feed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <ActivityFilter
            value={filter}
            onChange={setFilter}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <ActivitySkeleton key={i} />
              ))
            ) : filteredActivities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No activities to display
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage
                        src={activity.user?.avatar_url}
                        alt={activity.user?.name}
                      />
                      <AvatarFallback>
                        {getInitials(activity.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <ActivityTypeIcon 
                      type={activity.type}
                      className="absolute -bottom-1 -right-1"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">
                        {activity.user?.name || 'System'}
                      </span>
                      {' '}
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    {activity.metadata && (
                      <ActivityMetadata metadata={activity.metadata} />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at))} ago
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}