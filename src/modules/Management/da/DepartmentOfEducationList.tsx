import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';
import PageTitle from '@/components/global/PageTitle';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';
import DepartmentOfEducationTable from './DepartmentOfEducationTable';

export default function DepartmentOfEducationList() {
  return (
    <>
      <PageTitle
        extraItem={
          <CreateButton
            overrideText="Add Department Admin"
            moduleName={MODULE.DEPARTMENT_OF_EDUCATION}
            action={ACTION.ADD}
            redirectTo="/department-admin/add"
          />
        }
      >
        Department Admin List
      </PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="p-4">
          <DepartmentOfEducationTable />
        </div>
      </AppsContainer>
    </>
  );
}
