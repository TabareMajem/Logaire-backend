// src

import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../../../components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { useToast } from '../../../components/ui/toaster';
import { useIntegrationConfig } from '@/hooks/useIntegrationConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Save, TestTube } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const integrationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['shipping', 'customs', 'payment', 'document']),
  apiKey: z.string().min(1, 'API Key is required'),
  endpoint: z.string().url('Must be a valid URL'),
  enabled: z.boolean(),
  retryAttempts: z.number().min(0).max(10),
  timeout: z.number().min(1000).max(30000),
  webhookUrl: z.string().url().optional(),
  customHeaders: z.record(z.string()).optional(),
  rateLimiting: z.object({
    enabled: z.boolean(),
    maxRequests: z.number().min(1),
    timeWindow: z.number().min(1)
  })
});

type IntegrationConfig = z.infer<typeof integrationSchema>;

interface IntegrationConfigUIProps {
  integrationId?: string; // If provided, we're editing an existing integration
}

export function IntegrationConfigUI({ integrationId }: IntegrationConfigUIProps) {
  const { toast } = useToast();
  const {
    config,
    isLoading,
    error,
    saveConfig,
    testConnection
  } = useIntegrationConfig(integrationId);

  const form = useForm<IntegrationConfig>({
    resolver: zodResolver(integrationSchema),
    defaultValues: config || {
      enabled: true,
      retryAttempts: 3,
      timeout: 5000,
      rateLimiting: {
        enabled: true,
        maxRequests: 100,
        timeWindow: 60
      }
    }
  });

  const onSubmit = async (data: IntegrationConfig) => {
    try {
      await saveConfig(data);
      toast.success('Integration configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save integration configuration');
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testConnection(form.getValues());
      toast.success(result.success ? 'Success' : 'Error');
    } catch (error) {
      toast.error('Failed to test connection');
    }
  };

  if (isLoading) {
    return <div>Loading configuration...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">
          {integrationId ? 'Edit Integration' : 'New Integration'}
        </h2>
        <Badge variant="outline">
          {form.watch('type')}
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Integration Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Integration Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select integration type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="shipping">Shipping</SelectItem>
                      <SelectItem value="customs">Customs</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormDescription>
                  Your API key for authentication
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endpoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Endpoint</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  The base URL for API requests
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Enabled</FormLabel>
                    <FormDescription>
                      Enable or disable this integration
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rateLimiting.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Rate Limiting</FormLabel>
                    <FormDescription>
                      Enable rate limiting for this integration
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
} 