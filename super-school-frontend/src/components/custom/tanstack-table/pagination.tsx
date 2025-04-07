import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UIText from '@/components/global/Text/UIText';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalCount?: number;
  pageSize?: number;
  pageIndex?: number;
}

export function DataTablePagination<TData>({
  table,
  totalCount,
  pageSize,
  pageIndex,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2 my-3 flex-wrap">
      <span className="flex text-sm text-muted-foreground cursor-auto gap-1">
        <UIText>Showing</UIText> {pageIndex! * pageSize! + 1} to {Math.min((pageIndex! + 1) * pageSize!, totalCount!)}{' '}
        <UIText>of</UIText> {totalCount} <UIText>entries</UIText>
      </span>
      <div className="flex-1 text-sm text-muted-foreground">
        {/* {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected. */}
      </div>

      <div className="flex w-[200px] items-center justify-center text-sm font-medium">
        <UIText>Page Size</UIText>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center justify-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value: any) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[200px] items-center justify-center text-sm font-medium gap-1">
          <UIText>Page</UIText> {table.getState().pagination.pageIndex + 1} <UIText>of</UIText> {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">
              <UIText>Go to first page</UIText>
            </span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">
              <UIText>Go to previous page</UIText>
            </span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">
              <UIText>Go to next page</UIText>
            </span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">
              <UIText>Go to last page</UIText>
            </span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
