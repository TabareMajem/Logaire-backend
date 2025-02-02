"use client";

import { Input } from '../../../../components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

interface ContentFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
}

export function ContentFilters({ filters, onFilterChange }: ContentFiltersProps) {
  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search content..."
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
          <SelectItem value="email_template">Email Template</SelectItem>
          <SelectItem value="document_template">Document Template</SelectItem>
          <SelectItem value="help_article">Help Article</SelectItem>
          <SelectItem value="announcement">Announcement</SelectItem>
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
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}