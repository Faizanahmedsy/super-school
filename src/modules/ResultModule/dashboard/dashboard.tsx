import AppPageMeta from '@/app/components/AppPageMeta';
import ResultChart from './ResultChart';
import { ResultPerGradeChart } from './ResultPerGradeChart';

export default function Dashboard() {
  return (
    <>
      <AppPageMeta title="Dashboard" />
      <div className="grid grid-cols-3 gap-4">
        <ResultChart />
        <ResultPerGradeChart />
      </div>
    </>
  );
}
