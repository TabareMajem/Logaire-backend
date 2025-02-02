"use client";

import { useQuery } from '@tanstack/react-query';
import { Lightbulb } from 'lucide-react';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Badge } from '../../../../components/ui/badge';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: 'performance' | 'accuracy' | 'resource' | 'quality';
  implemented: boolean;
}

export function RecommendationsList() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      // Fetch recommendations implementation
      return [] as Recommendation[];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!recommendations?.length) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No recommendations available
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <Lightbulb className="h-5 w-5 text-primary" />
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{recommendation.title}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={recommendation.implemented ? 'default' : 'outline'}>
                    {recommendation.implemented ? 'Implemented' : 'Pending'}
                  </Badge>
                  <Badge variant={
                    recommendation.impact === 'high' ? 'destructive' :
                    recommendation.impact === 'medium' ? 'default' :
                    'secondary'
                  }>
                    {recommendation.impact} impact
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {recommendation.description}
              </p>
              
              <p className="text-sm">
                <span className="text-muted-foreground">Category: </span>
                <span className="font-medium">{recommendation.category}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}