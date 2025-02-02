"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Badge } from '../../../../components/ui/badge';

export function VoiceHistory() {
  

  const { data: interactions } = useQuery({
    queryKey: ['voice-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_interactions')
        .select(`
          *,
          transcripts:voice_transcripts(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Interaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {interactions?.map((interaction) => (
              <div
                key={interaction.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={interaction.status === 'completed' ? 'secondary' : 'default'}>
                    {interaction.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {interaction.transcripts?.map((transcript: any) => (
                    <div
                      key={transcript.id}
                      className={`text-sm ${
                        transcript.direction === 'input' 
                          ? 'text-blue-500' 
                          : 'text-green-500'
                      }`}
                    >
                      {transcript.content}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}