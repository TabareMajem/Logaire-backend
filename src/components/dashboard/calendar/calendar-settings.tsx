// src/components/dashboard/calendar/calendar-settings.tsx -->

"use client";

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { GoogleCalendarProvider } from '@/lib/calendar/providers/google';
import { CalendarProvider } from '@/lib/calendar/providers/types';
import { Icons } from '@/components/ui/icons';

const providers: CalendarProvider[] = [
  new GoogleCalendarProvider(),
  // Add more providers as needed
];

function CalendarProviderIcon({ type }: { type: CalendarProvider['type'] }) {
  const icons = {
    google: Icons.google,
    outlook: Icons.microsoft,
    ical: Icons.calendar
  };
  const Icon = icons[type];
  return <Icon className="h-5 w-5" />;
}

export function CalendarSettings() {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = async (provider: CalendarProvider) => {
    try {
      setIsConnecting(provider.id);
      await provider.connect();
      toast.success(`Connected to ${provider.name}`);
    } catch (error) {
      toast.error(`Failed to connect to ${provider.name}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (provider: CalendarProvider) => {
    try {
      setIsConnecting(provider.id);
      await provider.disconnect();
      toast.success(`Disconnected from ${provider.name}`);
    } catch (error) {
      toast.error(`Failed to disconnect from ${provider.name}`);
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-muted rounded-lg">
                  <CalendarProviderIcon type={provider.type} />
                </div>
                <div>
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {provider.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <Button
                variant={provider.connected ? 'outline' : 'default'}
                disabled={isConnecting === provider.id}
                onClick={() => {
                  if (provider.connected) {
                    handleDisconnect(provider);
                  } else {
                    handleConnect(provider);
                  }
                }}
              >
                {isConnecting === provider.id && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {provider.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}