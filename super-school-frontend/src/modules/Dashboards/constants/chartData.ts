import { ChartConfig } from '@/components/ui/chart';

export const dummyChartData = [
  { date: '2024-01-01', completed: { manual: 110, ai: 95 }, pending: { manual: 40, ai: 80 } },
  { date: '2024-01-02', completed: { manual: 105, ai: 90 }, pending: { manual: 45, ai: 85 } },
  { date: '2024-01-03', completed: { manual: 120, ai: 100 }, pending: { manual: 50, ai: 70 } },
  { date: '2024-01-04', completed: { manual: 130, ai: 110 }, pending: { manual: 60, ai: 90 } },
  { date: '2024-01-05', completed: { manual: 115, ai: 105 }, pending: { manual: 55, ai: 95 } },
  { date: '2024-02-01', completed: { manual: 125, ai: 115 }, pending: { manual: 50, ai: 85 } },
  { date: '2024-02-02', completed: { manual: 140, ai: 130 }, pending: { manual: 65, ai: 100 } },
  { date: '2024-02-03', completed: { manual: 135, ai: 120 }, pending: { manual: 60, ai: 95 } },
  { date: '2024-02-04', completed: { manual: 150, ai: 140 }, pending: { manual: 70, ai: 110 } },
  { date: '2024-02-05', completed: { manual: 160, ai: 145 }, pending: { manual: 75, ai: 115 } },
  { date: '2024-03-01', completed: { manual: 155, ai: 135 }, pending: { manual: 65, ai: 105 } },
  { date: '2024-03-02', completed: { manual: 145, ai: 125 }, pending: { manual: 60, ai: 95 } },
  { date: '2024-03-03', completed: { manual: 170, ai: 150 }, pending: { manual: 80, ai: 120 } },
  { date: '2024-03-04', completed: { manual: 175, ai: 155 }, pending: { manual: 85, ai: 125 } },
  { date: '2024-03-05', completed: { manual: 180, ai: 160 }, pending: { manual: 90, ai: 130 } },
  { date: '2024-04-01', completed: { manual: 120, ai: 102 }, pending: { manual: 50, ai: 100 } },
  { date: '2024-04-02', completed: { manual: 97, ai: 80 }, pending: { manual: 60, ai: 120 } },
  { date: '2024-04-03', completed: { manual: 167, ai: 100 }, pending: { manual: 70, ai: 50 } },
  // Add more data points as needed...
];

export const chartConfig = {
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-1))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-2))',
  },
  manual: {
    label: 'Manual',
    color: 'hsl(142, 76%, 36%)', // Green color
  },
  ai: {
    label: 'AI',
    color: 'hsl(0, 84%, 60%)', // Red color
  },
} satisfies ChartConfig;
