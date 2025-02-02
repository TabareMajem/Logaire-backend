"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { TimeFrame } from '@/lib/api/stats';

interface TimeframeSelectProps {
  value: TimeFrame;
  onChange: (value: TimeFrame) => void;
}

const OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
] as const;

export function TimeframeSelect({ value, onChange }: TimeframeSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(value: string) => onChange(value as TimeFrame)}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}