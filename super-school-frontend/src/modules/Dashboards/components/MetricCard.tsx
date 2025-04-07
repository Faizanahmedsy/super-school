import { Card } from '@/components/ui/card';
import { TrendingUp, User } from 'lucide-react';
import { DashboardStatsType } from '../types/dashboard.types';

type GeneralStatsProps = {
  stats: DashboardStatsType;
};

export default function MetricCard({ stats }: GeneralStatsProps) {
  return (
    <Card className="w-full p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <div className="text-2xl font-semibold">{stats.count ? stats.count : '-'}</div>
          <div className="text-sm text-muted-foreground">{stats.title}</div>
        </div>
      </div>
      {/* <div className="flex flex-col items-end">
        <div className="flex items-center text-emerald-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4 mr-1" />
          +10
        </div>
        <div className="text-xs text-muted-foreground">vs 30 days</div>
      </div> */}
    </Card>
  );
}
