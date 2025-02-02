// src/components/shipments/forms/shipment-type-select.tsx -->

"use client";

import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { ShipmentFormData } from '@/lib/validations/shipment';

interface ShipmentTypeSelectProps {
  control: Control<ShipmentFormData>;
}

export function ShipmentTypeSelect({ control }: ShipmentTypeSelectProps) {
  return (
    <FormField
      control={control}
      name="shipment_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Shipment Type</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shipment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fcl">Full Container Load (FCL)</SelectItem>
              <SelectItem value="lcl">Less than Container Load (LCL)</SelectItem>
              <SelectItem value="air">Air Freight</SelectItem>
              <SelectItem value="bulk">Bulk Cargo</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}