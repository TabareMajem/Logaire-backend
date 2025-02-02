// // components/ui/data-table.tsx -->

// "use client";

// import React from 'react';
// import { useTable } from 'react-table';

// interface DataTableProps {
//   columns: any[];
//   data: any[];
//   loading: boolean;
// }

// export const DataTable: React.FC<DataTableProps> = ({ columns, data, loading }) => {
//   const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
//     columns,
//     data,
//   });

//   return (
//     <div className="overflow-x-auto">
//       <table {...getTableProps()} className="min-w-full">
//         <thead>
//           {headerGroups.map(headerGroup => (
//             <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}> {/* Added key here */}
//               {headerGroup.headers.map(column => (
//                 <th
//                   {...column.getHeaderProps()}
//                   className="px-4 py-2 text-left"
//                   key={column.id}
//                 >
//                   {column.render('Header')}
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody {...getTableBodyProps()}>
//           {loading ? (
//             <tr>
//               <td colSpan={columns.length} className="text-center py-4">
//                 Loading...
//               </td>
//             </tr>
//           ) : rows.length > 0 ? (
//             rows.map(row => {
//               prepareRow(row);
//               return (
//                 <tr {...row.getRowProps()} key={row.id || row.index}> {/* Added key here */}
//                   {row.cells.map(cell => (
//                     <td {...cell.getCellProps()} className="px-4 py-2" key={cell.column.id}> {/* Added key here */}
//                       {cell.render('Cell')}
//                     </td>
//                   ))}
//                 </tr>
//               );
//             })
//           ) : (
//             <tr>
//               <td colSpan={columns.length} className="text-center py-4">
//                 No data available
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };



// components/ui/data-table.tsx
"use client";

import React from 'react';
import { useTable, Column } from 'react-table';

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
}

export function DataTable<T extends object>({ columns, data, loading }: DataTableProps<T>) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });

  return (
    <div className="overflow-x-auto">
      <table {...getTableProps()} className="min-w-full">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps()}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-500"
                  key={column.id}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                Loading...
              </td>
            </tr>
          ) : rows.length > 0 ? (
            rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map(cell => (
                    <td
                      {...cell.getCellProps()}
                      className="px-4 py-2 text-sm"
                      key={cell.column.id}
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4 text-sm text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}