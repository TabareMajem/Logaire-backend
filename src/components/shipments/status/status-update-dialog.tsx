// src/components/shipments/status/status-update-dialog.tsx

"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateShipmentStatus, getAllowedTransitions } from '@/lib/api/status';
import { ShipmentStatus } from '@/lib/api/shipments';

// Define the form values type
type FormValues = {
  newStatus: ShipmentStatus;
  reason?: string;
};

// Update the schema to match FormValues
const statusUpdateSchema = z.object({
  newStatus: z.string() as z.ZodType<ShipmentStatus>,
  reason: z.string().optional(),
});

// Define the status update type
type StatusUpdate = {
  shipmentId: string;
  newStatus: ShipmentStatus;
  reason?: string;
};

interface StatusUpdateDialogProps {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}

export function StatusUpdateDialog({ shipmentId, currentStatus }: StatusUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      newStatus: undefined,
      reason: '',
    },
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (data: StatusUpdate) => updateShipmentStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['shipments', shipmentId] 
      });
      toast.success('Status updated successfully');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    },
  });

  const allowedTransitions = getAllowedTransitions(currentStatus);

  if (allowedTransitions.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Update Status</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Shipment Status</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            updateStatus({
              shipmentId,
              newStatus: data.newStatus,
              reason: data.reason,
            });
          })}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="newStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allowedTransitions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter reason for status change"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  Update Status
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}