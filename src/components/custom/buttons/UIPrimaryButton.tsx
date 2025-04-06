import UIText from '@/components/global/Text/UIText';
import { Button, ButtonProps } from '@/components/ui/button';
import { ReactNode } from 'react';

interface UIPrimaryButtonProps extends ButtonProps {
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean | undefined;
}

export default function UIPrimaryButton({ icon, children, disabled, ...props }: UIPrimaryButtonProps) {
  return (
    <div>
      <Button {...props} variant="default" disabled={disabled}>
        {icon && <span className="mr-2">{icon}</span>}
        <UIText>{children}</UIText>
      </Button>
    </div>
  );
}
