import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  loading?: boolean;
}

export default function CustomButton({ className, children, loading = false }: ButtonProps) {
  return (
    <>
      {loading ? (
        <button className={cn('bg-gray-500', className)} disabled>
          Loading...
        </button>
      ) : (
        <button className={cn('', className)}>{children}</button>
      )}
    </>
  );
}
