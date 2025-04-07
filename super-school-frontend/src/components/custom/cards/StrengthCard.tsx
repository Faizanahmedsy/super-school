import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextBox } from './TextBox';
import { cn } from '@/lib/utils';

export default function StrengthCard({
  className,
  data,
  description,
  title,
}: {
  className?: string;
  data: unknown[];
  description?: string;
  title?: string;
}) {
  return (
    <>
      <Card className={cn('bg-teal-100 border border-teal-500 rounded-lg', className)}>
        <CardHeader>
          <CardTitle>{title ? title : 'Strength'}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          <CardContent className="p-0">
            {data?.map((item: any, index: number) => (
              <TextBox className="bg-teal-100" btn={false} key={index}>
                {index + 1}. {item}
              </TextBox>
            ))}
          </CardContent>
        </CardHeader>
      </Card>
    </>
  );
}
