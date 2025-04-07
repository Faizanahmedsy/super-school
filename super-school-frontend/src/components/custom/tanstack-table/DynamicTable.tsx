import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useState } from 'react';

import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UISelect from '@/components/global/Form/v4/UISelect';
import RenderNullableValue from '@/components/global/Text/RenderNullableValue';
import UIText from '@/components/global/Text/UIText';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import UILoader from '../loaders/UILoader';
import { DataTableFacetedFilter } from './MultiSelect';
import { DataTablePagination } from './pagination';
import UINoDataFound from '../UINoDataFound';
import { useIntl } from 'react-intl';
import useGlobalState from '@/store';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useLocation, useSearchParams } from 'react-router-dom';

interface SelectOption {
  label: string;
  value: string;
}

interface DynamicTableProps<T> {
  tableTitle?: string;
  data: T[];
  columns: ColumnDef<T>[];
  filterOptions?: {
    column: string;
    options: { label: string; value: string }[];
  }[];
  loading?: boolean;
  onSearchChange?: (searchTerm: string) => void;
  searchColumn?: string;
  searchPlaceholder?: any;
  totalCount: number;
  className?: string;
  moduleName?: string;
  pageSize?: number | undefined;
  pageIndex?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  selectFilters?: {
    key: string;
    placeholder: string | any;
    options: SelectOption[];
    onSelectChange: (value: string) => void;
    defaultValue?: string | number | undefined | any;
    value?: string | number | undefined;
    allowClear?: boolean;
    width?: string;
  }[];
  handleRowClick?: (id: number, e: React.MouseEvent) => void;
  dateRangePicker?: React.ReactNode;
  showPagination?: boolean;
}

export function DynamicTable<T>({
  showPagination = true,
  tableTitle,
  data,
  className,
  columns,
  filterOptions,
  searchColumn,
  searchPlaceholder,
  totalCount,
  pageSize = 10,
  pageIndex,
  onPaginationChange,
  selectFilters,
  dateRangePicker,
  loading,
  onSearchChange,
  moduleName,
  handleRowClick,
}: DynamicTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const user = useGlobalState((state) => state.user);
  const params = useLocation();

  // State to track selected values for each select filter
  const [_, setSelectedFilterValues] = useState<{
    [key: string]: string;
  }>({});

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / (pageSize ?? 1)),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pageIndex ?? 0,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater(table.getState().pagination);
        onPaginationChange?.(newPagination.pageIndex, newPagination.pageSize);
      } else {
        onPaginationChange?.(updater.pageIndex, updater.pageSize);
      }
    },
    // state: {
    //   sorting,
    //   columnFilters,
    //   columnVisibility,
    //   rowSelection,
    // },
  });

  // Function to handle select change for each select filter
  const handleSelectChange = (key: string, value: string) => {
    setSelectedFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Call the corresponding onSelectChange handler for each select filter
    const selectFilter = selectFilters?.find((filter) => filter.key === key);
    if (selectFilter) {
      selectFilter.onSelectChange(value);
    }
  };

  const intl = useIntl();

  return (
    <div className="w-full">
      <div className="text-base font-semibold text-black">
        <UIText>{tableTitle}</UIText>
      </div>
      <div
        className={cn(
          'py-4 flex flex-wrap gap-2 justify-start sm:justify-start md:justify-start md:gap-2 lg:gap-3',
          className
        )}
      >
        {moduleName && (
          <h2 className="mt-1 flex">
            <UIText>{moduleName}</UIText> : {totalCount}
          </h2>
        )}

        {searchColumn && (
          <Input
            placeholder={intl.formatMessage({ id: searchPlaceholder })}
            onChange={(event) => {
              const searchTerm = event.target.value;
              onSearchChange?.(searchTerm);
            }}
            style={{
              width: '100%',
              maxWidth: '300px',
              height: '42px',
            }}
            className="flex-shrink-0 placeholder-black"
          />
        )}

        {selectFilters?.map((selectFilter) => (
          <div key={selectFilter.key} className="mb-3">
            {selectFilter.key === 'yearstudymaterial' ? (
              <DatePicker
                picker="year"
                placeholder={selectFilter.placeholder}
                disabledDate={(date) => {
                  const currentYear = new Date().getFullYear();
                  return date.year() > currentYear;
                }}
                className="flex-shrink-0 w-full sm:w-[150px] lg:w-[200px]"
                onChange={(dateString: any) => handleSelectChange(selectFilter?.key, dateString)}
                value={selectFilter?.value ? dayjs(selectFilter?.value, 'YYYY') : null}
                allowClear
              />
            ) : (
              <UISelect
                onChange={(value: any) => handleSelectChange(selectFilter.key, value)}
                placeholder={<div className="text-black">{selectFilter.placeholder}</div>}
                className={cn('flex-shrink-0 w-full sm:w-[150px] lg:w-[200px]', selectFilter.width)}
                allowClear={selectFilter.allowClear === false ? false : true}
                defaultValue={selectFilter.defaultValue}
                value={selectFilter.value}
              >
                {selectFilter.options?.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </UISelect>
            )}
          </div>
        ))}

        {/* {selectFilters?.map((selectFilter) => (
          <UISelect
            key={selectFilter.key}
            onChange={(value: any) => handleSelectChange(selectFilter.key, value)}
            placeholder={<div className="text-black">{selectFilter.placeholder}</div>}
            className="flex-shrink-0 w-full sm:w-[150px] lg:w-[200px] mb-3"
            // allowClear={!selectFilter.allowClear ? false : true}
            allowClear
            defaultValue={selectFilter.defaultValue}
            value={selectFilter.value}
          >
            {selectFilter.options.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </UISelect>
        ))} */}
        {filterOptions?.map((filter) => (
          <DataTableFacetedFilter
            key={filter.column}
            column={table.getColumn(filter.column)}
            title={filter.column}
            options={filter.options}
            className="flex-shrink-0 w-full sm:w-auto lg:w-[200px]"
          />
        ))}
        <div className="flex-shrink-0">{dateRangePicker}</div>
      </div>

      <div className="w-full overflow-x-auto scroll-area border rounded-lg shadow-sm">
        <Table className="w-full min-w-[1300px] overflow-x-auto scroll-area">
          <TableHeader className="h-[60px] rounded-3xl">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    <UIText className="text-primary font-medium">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </UIText>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center ">
                  <UILoader />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row: any) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={`${handleRowClick && user.role_name === ROLE_NAME.TEACHER ? (['/teacher/list', '/parent/list'].includes(params?.pathname) && !(user.role_name === ROLE_NAME.TEACHER && user.details?.id === row.original?.id) ? '' : 'cursor-pointer') : 'cursor-pointer'}`}
                      onClick={() => {
                        let originalData: any = row?.original;
                        handleRowClick?.(Number(originalData?.id), originalData);
                      }}
                    >
                      {row.getVisibleCells().map((cell: any) => (
                        <TableCell key={cell.id} className="h-[60px]">
                          <RenderNullableValue value={flexRender(cell.column.columnDef.cell, cell.getContext())} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-black">
                      <div className="flex items-center justify-center h-[50dvh]">
                        <UINoDataFound />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <DataTablePagination table={table} totalCount={totalCount} pageIndex={pageIndex} pageSize={pageSize} />
      )}
    </div>
  );
}
