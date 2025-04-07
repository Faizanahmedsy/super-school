import AppsContainer from '@/app/components/AppsContainer';
import PageTitle from '@/components/global/PageTitle';
import NotificationListTable from './NotificationListTable';

export default function NotificationList() {
  return (
    <>
      <PageTitle>Notification List</PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="p-4">
          <NotificationListTable />
        </div>
      </AppsContainer>
    </>
  );
}
