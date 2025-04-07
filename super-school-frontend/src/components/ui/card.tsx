import * as React from 'react';

import { cn } from '@/lib/utils';
import UIText from '../global/Text/UIText';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-xl border bg-card text-card-foreground shadow mb-4', className)} {...props} />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 pt-6 px-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

// const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
//   ({ className, ...props }, ref) => (
//     <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props} />
//   )
// );
// CardTitle.displayName = 'CardTitle';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    const processedChildren = React.Children.map(children, (child) => {
      // Wrap string children in UIText for translation
      if (typeof child === 'string' && child !== '') {
        return <UIText as="span">{child}</UIText>;
      }
      return child;
    });

    return (
      <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props}>
        {processedChildren}
      </h3>
    );
  }
);
CardTitle.displayName = 'CardTitle';

// const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
//   ({ className, ...props }, ref) => (
//     <p ref={ref} className={cn('text-sm text-muted-foreground pb-4', className)} {...props} />
//   )
// );
// CardDescription.displayName = 'CardDescription';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const processedChildren = React.Children.map(children, (child) => {
      // Wrap string children in UIText for translation
      if (typeof child === 'string' && child !== '') {
        return <UIText as="span">{child}</UIText>;
      }
      return child;
    });

    return (
      <p ref={ref} className={cn('text-sm text-muted-foreground pb-4', className)} {...props}>
        {processedChildren}
      </p>
    );
  }
);

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
