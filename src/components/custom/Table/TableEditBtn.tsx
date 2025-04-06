import { Button } from '@/components/ui/button';
import usePermission from '@/hooks/role-based-access/usePermissions';
import { ACTION, ROLE_NAME } from '@/lib/helpers/authHelpers';
import { cn } from '@/lib/utils';
import useGlobalState from '@/store';
import { Pencil } from 'lucide-react';
import React from 'react';

const TableEditBtn = ({
  checkPermission = false,
  onClick,
  moduleName,
  className,
  Disabled,
}: {
  checkPermission?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  moduleName?: string;
  className?: string;
  Disabled?: boolean | undefined | any;
}) => {
  const user = useGlobalState((state) => state.user);

  const permissionCheckResult = usePermission(checkPermission ? (moduleName ?? '') : '', ACTION.EDIT);

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
      onClick={onClick}
      disabled={Disabled}
      className={cn(
        'relative overflow-hidden group',
        'h-10 w-10 p-0',
        'rounded-lg',
        'bg-white/90 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        'shadow-[0_2px_10px_rgba(0,0,0,0.03)]',
        'hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]',
        'border border-gray-200',
        'hover:border-blue-200',
        'hover:bg-white/95',
        Disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      variant="ghost"
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-50/30 to-transparent transition-opacity duration-300" />
      <Pencil
        size={16}
        className={cn(
          'text-gray-600',
          'transform transition-all duration-300',
          'group-hover:text-blue-500',
          'group-hover:scale-110',
          'group-hover:rotate-12'
        )}
      />
    </Button>
  );
};

export default TableEditBtn;
