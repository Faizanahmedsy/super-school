import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TableSkeletonLoaderProps {
  columnCount: number;
  rowCount?: number;
}

export const TableSkeletonLoader: React.FC<TableSkeletonLoaderProps> = ({ columnCount, rowCount = 5 }) => {
  return (
    <Table>
      <TableHeader className="bg-gray-50 h-[50px] rounded-3xl">
        <TableRow>
          {[...Array(columnCount)].map((_, index) => (
            <TableHead key={index} className="px-4 py-2">
              <Skeleton className="h-6 w-3/4" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rowCount)].map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {[...Array(columnCount)].map((_, colIndex) => (
              <TableCell key={colIndex} className="px-4 py-3">
                <div className={cn('animate-pulse rounded-md bg-muted h-5 w-full')} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
