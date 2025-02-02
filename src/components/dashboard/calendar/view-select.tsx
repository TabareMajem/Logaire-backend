// src/components/dashboard/calendar/view-select.tsx -->

"use client";

import { Button } from '@/components/ui/button';

interface ViewSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const views = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
] as const;

export function ViewSelect({ value, onChange }: ViewSelectProps) {
  return (
    <div className="flex items-center space-x-1">
      {views.map((view) => (
        <Button
          key={view.value}
          variant={value === view.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(view.value)}
        >
          {view.label}
        </Button>
      ))}
    </div>
  );
}