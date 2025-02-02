// src/lib/validations/shipments.ts -->

import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(2, 'Location name is required'),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90)
  ]).optional(),
  address: z.string().min(5, 'Address is required'),
  country: z.string().min(2, 'Country is required'),
});

const cargoSchema = z.object({
  description: z.string().min(3, 'Cargo description is required'),
  value: z.number().min(0, 'Value must be positive'),
  currency: z.string().min(3, 'Currency is required'),
  container_type: z.enum(['20GP', '40GP', '40HC', '45HC', 'LCL']).optional(),
  weight: z.number().min(0, 'Weight must be positive'),
  volume: z.number().min(0, 'Volume must be positive'),
  pieces: z.number().int().min(1, 'Number of pieces is required'),
  dangerous_goods: z.boolean().default(false),
  special_instructions: z.string().optional(),
});

export const shipmentSchema = z.object({
  shipment_type: z.enum(['fcl', 'lcl', 'air']),
  incoterm: z.string().min(3, 'Incoterm is required'),
  origin: locationSchema,
  destination: locationSchema,
  cargo: cargoSchema,
});

export type ShipmentFormData = z.infer<typeof shipmentSchema>;