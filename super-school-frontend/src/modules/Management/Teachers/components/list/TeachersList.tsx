import AppPageMeta from '@/app/components/AppPageMeta';
import PageTitle from '@/components/global/PageTitle';

import CreateButton from '@/components/custom/buttons/CreateButton';
import { Card } from 'antd';
import TeacherListTable from './TeacherListTable';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';

export default function TeachersList() {
  return (
    <>
      <div>
        <AppPageMeta title="Results List" />
        <PageTitle
          extraItem={<CreateButton moduleName={MODULE.TEACHERS} action={ACTION.ADD} redirectTo="/teacher/add" />}
        >
          Teacher List
        </PageTitle>
        <Card>
          <div className="p-4">
            <TeacherListTable />
          </div>
        </Card>
      </div>
    </>
  );
}
