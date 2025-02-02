// src/components/admin/integrations/integration-filters.tsx -->

"use client";

import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

interface IntegrationFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
}

export function IntegrationFilters({ filters, onFilterChange }: IntegrationFiltersProps) {
  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search integrations..."
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
          <SelectItem value="api">API</SelectItem>
          <SelectItem value="webhook">Webhook</SelectItem>
          <SelectItem value="sftp">SFTP</SelectItem>
          <SelectItem value="email">Email</SelectItem>
        </SelectContent>
      </Select>

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
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}