import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const UIFormCard = ({ children, title, description, className }: any) => {
  return (
    <Card className={cn('grid grid-cols-12 lg:gap-8 lg:p-4', className)}>
      <CardHeader className="lg:col-span-3  col-span-12">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="lg:col-span-9 col-span-12">
        <div className=" rounded-lg  lg:p-6">
          <div className="grid lg:grid-cols-2 gap-6">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
};
