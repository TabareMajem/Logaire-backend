// src/components/shipments/forms/cargo-details.tsx -->

"use client";

import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { ShipmentFormData } from '@/lib/validations/shipment';

interface CargoDetailsProps {
  control: Control<ShipmentFormData>;
  shipmentType: string;
}

export function CargoDetails({ control, shipmentType }: CargoDetailsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Cargo Details</h3>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="cargo.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <Textarea {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="cargo.value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <Input type="number" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="cargo.currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
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

        {shipmentType === 'fcl' && (
          <FormField
            control={control}
            name="cargo.container_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Container Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select container type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20GP">20&apos; General Purpose</SelectItem>
                    <SelectItem value="40GP">40&apos; General Purpose</SelectItem>
                    <SelectItem value="40HC">40&apos; High Cube</SelectItem>
                    <SelectItem value="45HC">45&apos; High Cube</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={control}
            name="cargo.weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <Input type="number" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="cargo.volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume (m³)</FormLabel>
                <Input type="number" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="cargo.pieces"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pieces</FormLabel>
                <Input type="number" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="cargo.dangerous_goods"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <div className="space-y-1 leading-none">
                <FormLabel>Dangerous Goods</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Check if shipping dangerous goods
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cargo.special_instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Instructions</FormLabel>
              <Textarea {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}