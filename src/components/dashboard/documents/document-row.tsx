// src/components/dashboard/documents/document-row.tsx -->

"use client";

import { formatDistanceToNow } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import { Document } from '@/lib/api/documents';
import { formatBytes } from '@/lib/utils/format';
import { DocumentStatus } from './document-status';
import { DocumentIcon } from './document-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';

interface DocumentRowProps {
  document: Document;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export function DocumentRow({ document, onDelete, onShare }: DocumentRowProps) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-lg bg-muted">
          <DocumentIcon type={document.type} className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{document.title}</p>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{formatBytes( parseInt(document.size))}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(document.updated_at))} ago</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <DocumentStatus status={document.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(document.url)}>
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(document.id)}>
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(document.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}