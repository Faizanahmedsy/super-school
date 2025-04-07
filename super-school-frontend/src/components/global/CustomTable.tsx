import { cn } from '@/lib/utils';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button, DatePicker, Input, Select } from 'antd';
import { useState } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';

const { RangePicker } = DatePicker;

type PaginationProps = {
  page: number;
  limit: number;
  totalRecords: number;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  handleLimitChange: (newLimit: number) => void;
};

interface TableProps<T extends object> {
  data: T[];
  columns: any;
  renderAddButton?: {
    state: boolean;
    onClick: () => unknown;
  };
  pagination?: PaginationProps;
  showSearchBar?: boolean;
  className?: string;
}

const TanstackTable = <T extends object>({
  data,
  columns,
  renderAddButton,
  pagination,
  showSearchBar,
  className,
}: TableProps<T>) => {
  const [globalFilter, setGlobalFilter] = useState('');
  // const [genderFilter, setGenderFilter] = useState("");

  // const { data: InstituteData } = useInstituteList({});

  // const { options } = useListOption({
  //   listData: InstituteData?.list,
  //   labelKey: 'institute_name',
  //   valueKey: 'id',
  // });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
      // columnFilters: genderFilter
      //   ? [{ id: "gender", value: genderFilter }]
      //   : [],
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className={cn('w-full mx-auto space-y-4', className)}>
      {showSearchBar && (
        <div className="flex space-x-4 justify-between">
          <div className="flex gap-6 ">
            <div className="">
              <Input
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(String(e.target.value))}
                placeholder="Search all columns..."
                className="w-fit"
              />
            </div>
            <div>
              <Select
                placeholder="Select an School"
                options={[
                  {
                    label: 'School 1',
                    value: '1',
                  },
                  {
                    label: 'School 2',
                    value: '2',
                  },
                ]}
              />
            </div>
            <div>
              <RangePicker />
            </div>
          </div>
          {renderAddButton?.state && (
            <div>
              <Button type="primary" icon={<IoAddCircleOutline />} onClick={renderAddButton.onClick}>
                Add Exam
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-gray-300 overflow-hidden">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && <PaginationControls<T> table={table} pagination={pagination} data={data} />}
    </div>
  );
};

export default TanstackTable;

const PaginationControls = <T extends object>({
  table,
  pagination,
  data = [],
}: {
  table: ReturnType<typeof useReactTable<T>>;
  pagination: PaginationProps;
  data?: T[];
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button> */}
          <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            // onClick={() => table.previousPage()}
            // disabled={!table.getCanPreviousPage()}
            onClick={pagination.handlePrevPage}
            disabled={pagination.page === 1}
          >
            {'<'}
          </button>
          <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            // onClick={() => table.nextPage()}
            // disabled={!table.getCanNextPage()}
            onClick={pagination.handleNextPage}
            disabled={data.length < pagination.limit}
          >
            {'>'}
          </button>
          <select value={pagination.limit} onChange={(e) => pagination.handleLimitChange(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          {/* <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button> */}
        </div>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </strong>
        </span>
      </div>
    </>
  );
};
