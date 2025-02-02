// src/components/shipments/shipment-filters.tsx -->

"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ShipmentStatus } from '@/lib/api/shipments';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from '../ui/date-range-picker';
import { Badge } from '../../../components/ui/badge';
import { format } from 'date-fns';

interface ShipmentsFiltersProps {
  onFilterChange: (filters: any) => void;
}

const statusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'booked', label: 'Booked' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'customs', label: 'Customs' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function ShipmentsFilters({ onFilterChange }: ShipmentsFiltersProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ShipmentStatus[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const queryClient = useQueryClient();

  const handleSearch = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, status, dateRange });
  };

  const handleStatusChange = (value: ShipmentStatus) => {
    const newStatus = status.includes(value)
      ? status.filter(s => s !== value)
      : [...status, value];
    setStatus(newStatus);
    onFilterChange({ search, status: newStatus, dateRange });
  };

  // const handleDateRangeChange = (range: DateRange | undefined) => {
  //   setDateRange(range);
  //   onFilterChange({ search, status, dateRange: range });
  // };
  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    setDateRange(range ? { start: range.from, end: range.to } : undefined);
    onFilterChange({ search, status, dateRange: range ? { start: range.from, end: range.to } : undefined });
  };

  const handleReset = () => {
    setSearch('');
    setStatus([]);
    setDateRange(undefined);
    onFilterChange({});
    queryClient.invalidateQueries({ queryKey: ['shipments'] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search shipments..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select
          value={status.length === 1 ? status[0] : undefined}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker
          value={dateRange ? { from: dateRange.start, to: dateRange.end } : undefined}
          onChange={handleDateRangeChange}
        />
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
      {(search || status.length > 0 || dateRange) && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {search && (
            <Badge variant="secondary" className="text-xs">
              Search: {search}
            </Badge>
          )}
          {status.map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">
              Status: {s}
            </Badge>
          ))}
          {dateRange && (
            <Badge variant="secondary" className="text-xs">
              Date: {format(dateRange.start, 'PP')} - {format(dateRange.end, 'PP')}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}