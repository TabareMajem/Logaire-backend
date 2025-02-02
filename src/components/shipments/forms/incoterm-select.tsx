// src/components/shipments/forms/incoterm-select.tsx -->

"use client";

import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { ShipmentFormData } from '@/lib/validations/shipment';

interface IncotermSelectProps {
  control: Control<ShipmentFormData>;
}

export function IncotermSelect({ control }: IncotermSelectProps) {
  return (
    <FormField
      control={control}
      name="incoterm"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Incoterm</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select incoterm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
              <SelectItem value="FOB">FOB (Free on Board)</SelectItem>
              <SelectItem value="CFR">CFR (Cost and Freight)</SelectItem>
              <SelectItem value="CIF">CIF (Cost, Insurance & Freight)</SelectItem>
              <SelectItem value="DAP">DAP (Delivered at Place)</SelectItem>
              <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}