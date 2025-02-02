"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Toast, ToastTitle, ToastDescription } from '../../../components/ui/toast';

const webhookEvents = [
  { id: 'shipment.created', label: 'Shipment Created' },
  { id: 'shipment.updated', label: 'Shipment Updated' },
  { id: 'shipment.delivered', label: 'Shipment Delivered' },
  { id: 'shipment.cancelled', label: 'Shipment Cancelled' },
] as const;

const webhookSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.string()).min(1, 'Select at least one event'),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

interface CreateWebhookDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWebhookDialog({ open, onClose }: CreateWebhookDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      events: [],
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormData) => {
      
      const { error } = await supabase
        .from('webhooks')
        .insert([
          {
            name: data.name,
            url: data.url,
            events: data.events,
            status: 'active',
          },
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      Toast({
        children: (
          <>
            <ToastTitle>Webhook created successfully</ToastTitle>
          </>
        ),
      });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      Toast({
        children: (
          <>
            <ToastTitle>Error creating webhook</ToastTitle>
            <ToastDescription>{error.message}</ToastDescription>
          </>
        ),
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: WebhookFormData) => {
    setIsSubmitting(true);
    createWebhookMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
          <DialogDescription>
            Set up a new webhook endpoint to receive event notifications.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="events"
              render={() => (
                <FormItem>
                  <FormLabel>Events</FormLabel>
                  <div className="space-y-2">
                    {webhookEvents.map((event) => (
                      <FormField
                        key={event.id}
                        control={form.control}
                        name="events"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={event.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(event.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, event.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== event.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {event.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Webhook'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}