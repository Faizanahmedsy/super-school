import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';
import React from 'react';

const TableViewBtn = ({
  onClick,
  // moduleName,
  className,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  moduleName?: string;
  className?: string;
}) => {
  // const canView = usePermission(moduleName, "view");

  // if (!canView) return null;

  return (
    <Button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden group',
        'h-10 w-10 p-0',
        'rounded-lg',
        'bg-white/90 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        'shadow-[0_2px_10px_rgba(0,0,0,0.03)]',
        'hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]',
        'border border-gray-200',
        'hover:border-emerald-200',
        'hover:bg-white/95',
        className
      )}
      variant="ghost"
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-50/30 to-transparent transition-opacity duration-300" />
      <Eye
        size={16}
        className={cn(
          'text-gray-600',
          'transform transition-all duration-300',
          'group-hover:text-emerald-500',
          'group-hover:scale-110'
        )}
      />
    </Button>
  );
};

export default TableViewBtn;
