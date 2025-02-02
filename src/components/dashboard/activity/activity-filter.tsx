"use client";

import { ActivityType } from '@/lib/api/activity';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

interface ActivityFilterProps {
  value: ActivityType | 'all';
  onChange: (value: ActivityType | 'all') => void;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Activities' },
  { value: 'shipment', label: 'Shipments' },
  { value: 'booking', label: 'Bookings' },
  { value: 'document', label: 'Documents' },
  { value: 'system', label: 'System' },
] as const;

export function ActivityFilter({ value, onChange }: ActivityFilterProps) {
  return (
    <Select
      value={value}
      onValueChange={(value: string) => onChange(value as ActivityType | 'all')}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter activities" />
      </SelectTrigger>
      <SelectContent>
        {FILTER_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}