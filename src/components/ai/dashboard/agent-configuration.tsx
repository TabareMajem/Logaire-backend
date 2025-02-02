"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '../../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../components/ui/select';
import { Slider } from '../../../../components/ui/slider';
import { Switch } from '../../../../components/ui/switch';
import { useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function AgentConfiguration() {
  const { data: config, isLoading } = useQuery({
    queryKey: ['agent-config'],
    queryFn: async () => {
      const response = await fetch('/api/ai/config');
      if (!response.ok) throw new Error('Failed to fetch configuration');
      return response.json();
    }
  });

  const [settings, setSettings] = useState({
    defaultModel: 'claude-3-sonnet-20240229',
    maxTokens: 1024,
    temperature: 0.7,
    autoScaling: true,
    monitoring: true
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save configuration');
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  if (isLoading) return <div>Loading configuration...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Model Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default Model</Label>
            <Select
              value={settings.defaultModel}
              onValueChange={(value) => 
                setSettings(prev => ({ ...prev, defaultModel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Max Tokens</Label>
            <Slider
              value={[settings.maxTokens]}
              onValueChange={([value]) => 
                setSettings(prev => ({ ...prev, maxTokens: value }))
              }
              max={4096}
              step={128}
            />
            <div className="text-sm text-muted-foreground">
              {settings.maxTokens} tokens
            </div>
          </div>

          <div className="space-y-2">
            <Label>Temperature</Label>
            <Slider
              value={[settings.temperature]}
              onValueChange={([value]) => 
                setSettings(prev => ({ ...prev, temperature: value }))
              }
              max={1}
              step={0.1}
            />
            <div className="text-sm text-muted-foreground">
              {settings.temperature.toFixed(1)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Auto Scaling</Label>
            <Switch
              checked={settings.autoScaling}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, autoScaling: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Performance Monitoring</Label>
            <Switch
              checked={settings.monitoring}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, monitoring: checked }))
              }
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 