import AppsContainer from '@/app/components/AppsContainer';
import PageTitle from '@/components/global/PageTitle';
import ParentListTable from './parentListTable';

export default function ParentList() {
  return (
    <>
      <PageTitle
      // HIDE THIS BUTTON BECAUSE THIS FEATURE IS NOT REQUIRED ANYMORE
      // extraItem={<CreateButton moduleName={MODULE.PARENTS} action={ACTION.ADD} redirectTo="/parent/add" />}
      >
        Parent List
      </PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="p-4">
          <ParentListTable />
        </div>
      </AppsContainer>
    </>
  );
}
