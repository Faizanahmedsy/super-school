import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';
import PageTitle from '@/components/global/PageTitle';
import StudentsListTable from './studentsLIstTable';
import { MODULE } from '@/lib/helpers/authHelpers';

export default function StudentsList() {
  return (
    <>
      <AppPageMeta title="Students" />
      <PageTitle extraItem={<CreateButton moduleName={MODULE.STUDENTS} action="add" redirectTo="/learner/add" />}>
        Learner List
      </PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="p-4">
          <StudentsListTable />
        </div>
      </AppsContainer>
    </>
  );
}
