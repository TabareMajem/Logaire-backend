// src/components/shipments/shipment-actions.tsx -->

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Pencil, Ban, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cancelShipment, updateShipmentStatus } from '@/lib/api/shipments';
import type { Shipment } from '@/lib/api/shipments';

interface ShipmentActionsProps {
  shipment: Shipment;
}

export function ShipmentActions({ shipment }: ShipmentActionsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: handleCancel } = useMutation({
    mutationFn: cancelShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment', shipment.id] });
      toast.success('Shipment cancelled successfully');
      setShowCancelDialog(false);
    },
    onError: () => {
      toast.error('Failed to cancel shipment');
    }
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Shipment['status'] }) =>
      updateShipmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment', shipment.id] });
      toast.success('Shipment status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update shipment status');
    }
  });

  const canCancel = ['draft', 'pending'].includes(shipment.status);
  const canSubmit = shipment.status === 'draft';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => router.push(`/shipments/${shipment.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Shipment
          </DropdownMenuItem>

          {canSubmit && (
            <DropdownMenuItem 
              onClick={() => updateStatus({ id: shipment.id, status: 'pending' })}
            >
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </DropdownMenuItem>
          )}

          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel Shipment
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Shipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this shipment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleCancel(shipment.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}