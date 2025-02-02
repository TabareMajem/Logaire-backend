  // src/components/shipments/details/documents/document-card.tsx -->

  "use client";

  import { formatDistanceToNow } from 'date-fns';
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import { MoreVertical, Download, Trash2, History } from 'lucide-react';
  import { ShipmentDocument } from '@/lib/api/documents';
  import { DocumentIcon } from './document-icon';
  import { DocumentStatus } from './document-status';
  import { useToast } from '@/hooks/use-toast';
  import { Button } from '@/components/ui/button';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '../../../../../components/ui/dropdown-menu';
  import { deleteDocument, downloadDocument } from '@/lib/api/documents';
  import { formatBytes } from '@/lib/utils/format';

  interface DocumentCardProps {
    document: ShipmentDocument;
    shipmentId: string;
  }

  export function DocumentCard({ document, shipmentId }: DocumentCardProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { mutate: handleDelete } = useMutation({
      mutationFn: deleteDocument,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ['shipment-documents', shipmentId]});
        toast.success('Document deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete document');
      }
    });

    const handleDownload = async () => {
      try {
        await downloadDocument(document.id);
        toast.success('Document downloaded successfully');
      } catch (error) {
        toast.error('Failed to download document');
      }
    };

    return (
      <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="p-2 bg-muted rounded-lg">
          <DocumentIcon type={document.type} className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium truncate">{document.file_name}</h4>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatBytes(document.file_size)}</span>
                <span>•</span>
                <span>Version {document.version}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(document.created_at))} ago</span>
              </div>
            </div>
            <DocumentStatus status={document.status} />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <History className="mr-2 h-4 w-4" />
              View History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => handleDelete(document.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }