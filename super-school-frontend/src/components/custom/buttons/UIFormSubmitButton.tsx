import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';
import BtnLoader from './btn-loader';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  api?: ApiType;
  className?: string;
  children: ReactNode;
}

type ApiType =
  | {
      isLoading?: boolean;
      isSuccess?: boolean;
      isError?: boolean;
      isPending?: boolean;
    }
  | null
  | undefined;

export default function UIFormSubmitButton({ api, className, children, ...props }: BtnProps) {
  return (
    <Button disabled={api?.isPending ?? false} className={cn('', className)} {...props}>
      {api?.isPending ? (
        <div className="flex">
          <BtnLoader />
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
