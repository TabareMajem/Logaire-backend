// src/components/shipments/forms/create-shipment-form.tsx -->

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Form } from '../../../../components/ui/form';
import { Button } from '../../../../components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LocationFields } from './location-fields';
import { CargoDetails } from './cargo-details';
import { ShipmentTypeSelect } from './shipment-type-select';
import { IncotermSelect } from './incoterm-select';
import { shipmentSchema, type ShipmentFormData } from '@/lib/validations/shipment';
import { createShipment } from '@/lib/api/shipments';
import { ShipmentStatus } from '@/lib/api/shipments';

export function CreateShipmentForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      cargo: {
        dangerous_goods: false,
      },
    },
  });

  const { mutate: submitShipment, isPending } = useMutation({
    mutationFn: createShipment,
    onSuccess: (data) => {
      toast.success('Shipment created successfully');
      router.push(`/shipments/${data}`);
    },
    onError: (error) => {
      toast.error('Failed to create shipment');
    },
  });

  const onSubmit = (data: ShipmentFormData) => {
    // Prepare the full shipment data, ensuring coordinates are always defined
    const shipmentData = {
      ...data,
      status: 'draft' as ShipmentStatus, // Set status to 'draft', which is a valid value of ShipmentStatus
      reference_number: generateReferenceNumber(), // Add reference number logic here
      estimated_departure: new Date().toISOString(), // Set estimated departure (can be updated)
      estimated_arrival: '', // You can leave this empty or set a value
      created_by: 'user-id', // Set the current user ID here
      origin: {
        ...data.origin,
        coordinates: data.origin.coordinates || [0, 0], // Default coordinates if not provided
      },
      destination: {
        ...data.destination,
        coordinates: data.destination.coordinates || [0, 0], // Default coordinates if not provided
      },
    };
  
    // Pass the prepared data to the mutation function
    submitShipment(shipmentData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ShipmentTypeSelect control={form.control} />
          <IncotermSelect control={form.control} />
        </div>

        <LocationFields
          control={form.control}
          originName="origin"
          destinationName="destination"
        />

        <CargoDetails
          control={form.control}
          shipmentType={form.watch('shipment_type')}
        />

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Shipment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Generate a reference number (you can change this logic)
function generateReferenceNumber() {
  return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
