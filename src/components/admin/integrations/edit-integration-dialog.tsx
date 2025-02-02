// src/components/admin/integrations/edit-integration-dialog.tsx -->

"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

// Define the form schema
const integrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  carrier: z.string().min(1, 'Carrier is required'),
  api_key: z.string().min(1, 'API Key is required'),
  api_secret: z.string().optional(),
  endpoint_url: z.string().url('Must be a valid URL'),
  settings: z.record(z.any()).optional(),
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

interface EditIntegrationDialogProps {
  integration: any; // Replace with your integration type
  open: boolean;
  onClose: () => void;
}

export function EditIntegrationDialog({
  integration,
  open,
  onClose,
}: EditIntegrationDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();


  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      name: integration.name,
      carrier: integration.carrier,
      api_key: integration.api_key,
      api_secret: integration.api_secret || '',
      endpoint_url: integration.endpoint_url,
      settings: integration.settings || {},
    },
  });

  const { mutate: updateIntegration, isPending } = useMutation({
    mutationFn: async (data: IntegrationFormData) => {
      const { error } = await supabase
        .from('carrier_integrations')
        .update(data)
        .eq('id', integration.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update integration');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Integration</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          {/* <form onSubmit={form.handleSubmit(updateIntegration)} className="space-y-6"> */}
          <form onSubmit={form.handleSubmit((data) => updateIntegration(data))} className="space-y-6" >
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
              name="carrier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="ups">UPS</SelectItem>
                      <SelectItem value="dhl">DHL</SelectItem>
                      <SelectItem value="usps">USPS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endpoint_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}