"use client";

import { useState } from 'react';
import { Mic, MicOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VoiceSettings } from './VoiceSettings';
import { useVoiceControl } from '@/hooks/use-voice-control';

export function VoiceControl() {
  const [showSettings, setShowSettings] = useState(false);
  const { isListening, startListening, stopListening, isProcessing } = useVoiceControl();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Voice Control</h3>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            className="rounded-full w-16 h-16"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>

        {isProcessing && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Processing your request...
          </p>
        )}

        <VoiceSettings 
          open={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      </CardContent>
    </Card>
  );
}