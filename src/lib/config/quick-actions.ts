import { LucideIcon, Plus, Search, FileText, Ship, Calendar } from 'lucide-react';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  permission?: {
    action: string;
    subject: string;
  };
}

export const quickActions: QuickAction[] = [
  {
    id: 'new-booking',
    title: 'New Booking',
    description: 'Create a new freight booking',
    icon: Plus,
    href: '/bookings/new',
    color: 'bg-blue-500',
    permission: {
      action: 'create',
      subject: 'bookings'
    }
  },
  {
    id: 'track-shipment',
    title: 'Track Shipment',
    description: 'View shipment status',
    icon: Search,
    href: '/shipments/track',
    color: 'bg-green-500',
    permission: {
      action: 'read',
      subject: 'shipments'
    }
  },
  {
    id: 'upload-documents',
    title: 'Upload Documents',
    description: 'Add shipping documentation',
    icon: FileText,
    href: '/documents/upload',
    color: 'bg-amber-500',
    permission: {
      action: 'create',
      subject: 'documents'
    }
  },
  {
    id: 'view-shipments',
    title: 'Active Shipments',
    description: 'View all active shipments',
    icon: Ship,
    href: '/shipments',
    color: 'bg-purple-500',
    permission: {
      action: 'read',
      subject: 'shipments'
    }
  },
  {
    id: 'schedule-pickup',
    title: 'Schedule Pickup',
    description: 'Arrange freight collection',
    icon: Calendar,
    href: '/bookings/schedule',
    color: 'bg-rose-500',
    permission: {
      action: 'create',
      subject: 'bookings'
    }
  }
];