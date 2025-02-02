"use client";

import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

interface NotificationFiltersProps {
  filters: {
    search: string;
    type: string;
    severity: string;
  };
  onFilterChange: (filters: any) => void;
}

export function NotificationFilters({ filters, onFilterChange }: NotificationFiltersProps) {
  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search notifications..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="max-w-sm"
      />
      
      <Select
        value={filters.type}
        onValueChange={(value: any) => onFilterChange({ ...filters, type: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="security">Security</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="integration">Integration</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.severity}
        onValueChange={(value: any) => onFilterChange({ ...filters, severity: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Severities</SelectItem>
          <SelectItem value="info">Info</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="error">Error</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}