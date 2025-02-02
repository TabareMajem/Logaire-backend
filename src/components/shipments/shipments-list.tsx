// // src/components/shipments/shipment-list.tsx -->

// "use client";

// import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { Shipment, ShipmentFilters, fetchShipments } from '@/lib/api/shipments';
// import { ShipmentStatus } from './shipment-status';
// import { LocationDisplay } from './location-display';
// import { ShipmentsFilters } from './shipments-filters';
// import { DataTable } from '../../../components/ui/data-table';
// import { Pagination } from '../../../components/ui/pagination';
// import { Card } from '@/components/ui/card';
// import { Link } from 'lucide-react';
// import { format } from 'date-fns';

// const ITEMS_PER_PAGE = 10;

// export function ShipmentsList() {
//   const [filters, setFilters] = useState<ShipmentFilters>({
//     page: 0,
//     limit: ITEMS_PER_PAGE
//   });

//   const { data, isLoading } = useQuery({
//     queryKey: ['shipments', filters],
//     queryFn: () => fetchShipments(filters)
//   });

//   interface Column {
//     accessorKey: string;
//     header: string;
//     cell: (props: { row: any }) => JSX.Element;
//   }
//   const columns = [
//     {
//       accessorKey: 'reference_number',
//       header: 'Reference',
//       cell: ({ row }: { row: Shipment }) => (
//         <Link 
//           href={`/shipments/${row.id}`}
//           className="font-medium hover:underline"
//         >
//           {row.reference_number}
//         </Link>
//       )
//     },
//     {
//       accessorKey: 'status',
//       header: 'Status',
//       cell: ({ row }: { row: Shipment }) => (
//         <ShipmentStatus status={row.status} />
//       )
//     },
//     {
//       accessorKey: 'origin',
//       header: 'Origin',
//       cell: ({ row }: { row: Shipment }) => (
//         <LocationDisplay location={row.origin} />
//       )
//     },
//     {
//       accessorKey: 'destination',
//       header: 'Destination',
//       cell: ({ row }: { row: Shipment }) => (
//         <LocationDisplay location={row.destination} />
//       )
//     },
//     {
//       accessorKey: 'estimated_departure',
//       header: 'Departure',
//       cell: ({ row }: { row: Shipment }) => format(new Date(row.estimated_departure), 'PP')
//     },
//     {
//       accessorKey: 'estimated_arrival',
//       header: 'Arrival',
//       cell: ({ row }: { row: Shipment }) => format(new Date(row.estimated_arrival), 'PP')
//     }
//   ];
  
//   const handlePageChange = (page: number) => {
//     setFilters(prev => ({ ...prev, page }));
//   };

//   const handleFilterChange = (newFilters: Partial<ShipmentFilters>) => {
//     setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
//   };

//   return (
//     <Card>
//       <div className="p-6 space-y-4">
//         <ShipmentsFilters onFilterChange={handleFilterChange} />
        
//         {/* <DataTable
//           columns={columns}
//           data={data?.data || []}
//           loading={isLoading}
//         /> */}
//         <DataTable
//           columns={columns}
//           data={data?.data || []}
//           loading={isLoading}
//         />

//         <Pagination
//           currentPage={filters.page}
//           totalPages={Math.ceil((data?.meta.total || 0) / ITEMS_PER_PAGE)}
//           onPageChange={handlePageChange}
//         />
//       </div>
//     </Card>
//   );
// }



// src/components/shipments/shipment-list.tsx
"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Column } from 'react-table';
import Link from 'next/link';
import { format } from 'date-fns';
import { Shipment, ShipmentFilters, fetchShipments } from '@/lib/api/shipments';
import { ShipmentStatus } from './shipment-status';
import { LocationDisplay } from './location-display';
import { ShipmentsFilters } from './shipments-filters';
import { DataTable } from '../../../components/ui/data-table';
import { Pagination } from '../../../components/ui/pagination';
import { Card } from '@/components/ui/card';

const ITEMS_PER_PAGE = 10;

export function ShipmentsList() {
  const [filters, setFilters] = useState<ShipmentFilters>({
    page: 0,
    limit: ITEMS_PER_PAGE
  });

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', filters],
    queryFn: () => fetchShipments(filters)
  });

  const columns = useMemo<Column<Shipment>[]>(() => [
    {
      Header: 'Reference',
      accessor: 'reference_number',
      Cell: ({ row }) => (
        <Link 
          href={`/dashboard/shipments/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.reference_number}
        </Link>
      )
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => <ShipmentStatus status={value} />
    },
    {
      Header: 'Origin',
      accessor: 'origin',
      Cell: ({ value }) => <LocationDisplay location={value} />
    },
    {
      Header: 'Destination',
      accessor: 'destination',
      Cell: ({ value }) => <LocationDisplay location={value} />
    },
    {
      Header: 'Departure',
      accessor: 'estimated_departure',
      Cell: ({ value }) => format(new Date(value), 'PP')
    },
    {
      Header: 'Arrival',
      accessor: 'estimated_arrival',
      Cell: ({ value }) => format(new Date(value), 'PP')
    }
  ], []);
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters: Partial<ShipmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  return (
    <Card>
      <div className="p-6 space-y-4">
        <ShipmentsFilters onFilterChange={handleFilterChange} />
        
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
        />

        <Pagination
          currentPage={filters.page}
          totalPages={Math.ceil((data?.meta?.total || 0) / ITEMS_PER_PAGE)}
          onPageChange={handlePageChange}
        />
      </div>
    </Card>
  );
}