// src/components/shipments/details/costs/add-cost-buttons.tsx -->

"use client";

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { Input } from '@/components/ui/input';
import { createCost } from '@/lib/api/costs';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const costTypes = [
  { value: 'transport', label: 'Transport' },
  { value: 'storage', label: 'Storage' },
  { value: 'customs', label: 'Customs' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
] as const;

const formSchema = z.object({
  cost_type: z.enum(['transport', 'storage', 'customs', 'documentation', 'insurance', 'other']),
  description: z.string().min(1, 'Description is required'),
  amount: z.string().min(1, 'Amount is required').transform(Number),
  currency: z.string().min(1, 'Currency is required'),
  invoice_number: z.string().optional(),
  vendor_name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCostButtonProps {
  shipmentId: string;
}

export function AddCostButton({ shipmentId }: AddCostButtonProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost_type: 'transport',
      description: '',
      amount: 0,
      currency: 'USD',
      invoice_number: '',
      vendor_name: '',
    },
  });

  const { mutate: handleSubmit, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      createCost({
          shipment_id: shipmentId,
          ...values,
          status: 'cancelled'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['shipment-costs', shipmentId] 
      });
      toast.success('Cost added successfully');
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error('Failed to add cost');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Cost
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Cost</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => handleSubmit(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="cost_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cost type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {costTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter cost description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter invoice number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vendor name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ? 'Adding...' : 'Add Cost'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}