// src/components/shipments/forms/location-fields.tsx -->

"use client";

import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { LocationSearch } from './location-search';
import { ShipmentFormData } from '@/lib/validations/shipment';

interface LocationFieldsProps {
  control: Control<ShipmentFormData>;
  originName: string;
  destinationName: string;
}

export function LocationFields({ control, originName, destinationName }: LocationFieldsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Locations</h3>
      
      <div className="grid gap-6 md:grid-cols-2">
        
        <FormField
          control={control}
          name={`origin.name`} // This should match the field path in your form
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin</FormLabel>
              <LocationSearch
                value={field.value || ''} // Ensure it's a string
                onChange={field.onChange}
                placeholder="Search origin location..."
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`destination.name`} // This should match the field path in your form
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <LocationSearch
                value={field.value || ''} // Ensure it's a string
                onChange={field.onChange}
                placeholder="Search destination location..."
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}