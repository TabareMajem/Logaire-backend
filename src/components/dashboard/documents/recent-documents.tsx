"use client";

import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { fetchShipmentDocuments } from '@/lib/api/documents';
import { DocumentRow } from './document-row';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import Link from 'next/link';

export function RecentDocuments() {
  const { toast } = useToast();
  const { data: documents, isLoading } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: () => fetchShipmentDocuments("5")
  });

  const handleDelete = async (id: string) => {
    // TODO: Implement document deletion
    toast.success('Document deleted successfully');
  };

  const handleShare = async (id: string) => {
    // TODO: Implement document sharing
    toast.success('Share link copied to clipboard');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Documents</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documents">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Documents</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/documents">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {documents?.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}