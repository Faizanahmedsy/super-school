import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';
import UIText from '../global/Text/UIText';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        cust_01: 'bg-emerald-200 text-emerald-900',
        'nsc-secondary': 'bg-secondary text-primary',
        // ai_magic:
        //   'bg-gradient-to-tl from-nsc-green-light via-nsc-honey to-nsc-red-light text-white shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-nsc-red-light',
        ai_magic: 'bg-primary text-primary-foreground',
        // ai_magic:
        //   'bg-gradient-to-t from-nsc-honey-light to-nsc-honey text-white shadow-lg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-nsc-red-light',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        <UIText>{children}</UIText>
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
