import AppPageMeta from '@/app/components/AppPageMeta';
import CreateButton from '@/components/custom/buttons/CreateButton';
import PageTitle from '@/components/global/PageTitle';
import { Card } from 'antd';
import AdminListTable from './AdminListTable';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';

export default function AdminList() {
  return (
    <>
      <div>
        <AppPageMeta title="Admin List" />
        <PageTitle extraItem={<CreateButton moduleName={MODULE.ADMIN} action={ACTION.ADD} redirectTo="/admin/add" />}>
          Admin List
        </PageTitle>

        <Card>
          <div className="p-4">
            <AdminListTable />
          </div>
        </Card>
      </div>
    </>
  );
}
