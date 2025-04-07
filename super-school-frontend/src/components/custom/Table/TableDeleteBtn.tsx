import { Button } from '@/components/ui/button';
import usePermission from '@/hooks/role-based-access/usePermissions';
import { ACTION, ROLE_NAME } from '@/lib/helpers/authHelpers';
import { cn } from '@/lib/utils';
import useGlobalState from '@/store';
import { Trash2 } from 'lucide-react';
import React from 'react';
import BtnLoader from '../buttons/btn-loader';

interface DeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checkPermission?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  moduleName?: string;
  className?: string;
  api?: {
    isPending?: boolean;
  };
  Disabled?: boolean | undefined | any;
}

const TableDeleteBtn = ({
  checkPermission = false,
  onClick,
  moduleName,
  className,
  api,
  Disabled,
  ...props
}: DeleteButtonProps) => {
  const user = useGlobalState((state) => state.user);

  const permissionCheckResult = usePermission(checkPermission ? (moduleName ?? '') : '', ACTION.DELETE);

  let shouldRenderButton = !checkPermission || permissionCheckResult;

  if (user?.role_name === ROLE_NAME.SUPER_ADMIN) {
    shouldRenderButton = true;
  }

  if (user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION) {
    shouldRenderButton = false;
  }

  if (!shouldRenderButton) return null;

  return (
    <Button
      {...props}
      onClick={onClick}
      disabled={Disabled || (api ? (api.isPending ?? false) : false)}
      className={cn(
        'relative overflow-hidden group',
        'h-10 w-10 p-0',
        'rounded-lg',
        'bg-white/90 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        'shadow-[0_2px_10px_rgba(0,0,0,0.03)]',
        'hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]',
        'border border-gray-200',
        'hover:border-red-200',
        'hover:bg-white/95',
        (Disabled || api?.isPending) && 'opacity-50 cursor-not-allowed',
        className
      )}
      variant="ghost"
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-red-50/30 to-transparent transition-opacity duration-300" />
      {api?.isPending ? (
        <div className="relative z-10">
          <BtnLoader />
        </div>
      ) : (
        <Trash2
          size={16}
          className={cn(
            'text-gray-600',
            'transform transition-all duration-300',
            'group-hover:text-red-500',
            'group-hover:scale-110',
            'group-hover:-rotate-12'
          )}
        />
      )}
    </Button>
  );
};

export default TableDeleteBtn;
