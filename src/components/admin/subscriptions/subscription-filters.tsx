"use client";

import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

interface SubscriptionFiltersProps {
  filters: {
    search: string;
    status: string;
    plan: string;
  };
  onFilterChange: (filters: any) => void;
}

export function SubscriptionFilters({ filters, onFilterChange }: SubscriptionFiltersProps) {
  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search companies..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="max-w-sm"
      />
      
      <Select
        value={filters.status}
        onValueChange={(value: any) => onFilterChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="past_due">Past Due</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="trial">Trial</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.plan}
        onValueChange={(value: any) => onFilterChange({ ...filters, plan: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Plans</SelectItem>
          <SelectItem value="starter">Starter</SelectItem>
          <SelectItem value="professional">Professional</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}