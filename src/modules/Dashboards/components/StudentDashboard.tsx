import AppPageMeta from '@/app/components/AppPageMeta';
import { QuizChart } from './charts/QuizChart';
import StudentPracticeDashboard from './charts/StudentPracticeDashboard';

export default function StudentDashboard() {
  return (
    <>
      <AppPageMeta title="Dashboard" />

      <section>
        <div className="grid lg:grid-cols-4 gap-4 mb-10">
          <div className="md:col-span-2 lg:col-span-4 h-full">
            <QuizChart />
          </div>
          <div className="md:col-span-2 lg:col-span-4 h-full">
            <StudentPracticeDashboard />
          </div>
        </div>
      </section>
    </>
  );
}
