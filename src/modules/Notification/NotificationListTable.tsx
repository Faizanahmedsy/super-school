import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { useTableFiltersV1 } from '@/hooks/table/use-table-filter-v1';
import { useNotificationList } from '@/services/notification/notification.hook';
import { ColumnDef } from '@tanstack/react-table';
import { useNotificationListFilters } from './hooks/useNotificationListFilters';

export default function NotificationListTable() {
  const { pageQuery, selectFilters, handlePaginationChange, handleSearchChange } = useNotificationListFilters({
    sort: 'desc',
    onFiltersChange: (filters) => {},
  });
  const notificationQuery = useNotificationList(pageQuery);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'message',
      header: 'Message',
    },
    // {
    //   accessorKey: 'is_read',
    //   header: 'Is Read',
    //   cell: ({ row }) => {
    //     const isRead = row.getValue('is_read');

    //     return (
    //       <div className="flex items-center justify-center">
    //         {isRead ? (
    //           <div className="flex items-center gap-1 text-green-600">
    //             <Check size={16} />
    //             <span className="text-sm">Read</span>
    //           </div>
    //         ) : (
    //           <div className="flex items-center gap-1 text-gray-500">
    //             <X size={16} />
    //             <span className="text-sm">Unread</span>
    //           </div>
    //         )}
    //       </div>
    //     );
    //   },
    // },
  ];

  return (
    <div>
      <DynamicTable
        searchColumn="name"
        searchPlaceholder="Search by Name"
        moduleName={'Notification'}
        data={notificationQuery.data?.list ? notificationQuery?.data?.list : []}
        columns={columns}
        totalCount={notificationQuery.data?.total || 0}
        pageSize={pageQuery.limit}
        pageIndex={(pageQuery.page ?? 1) - 1}
        onPaginationChange={handlePaginationChange}
        loading={notificationQuery.isLoading}
        onSearchChange={handleSearchChange}
        selectFilters={selectFilters}
        // selectFilters={[
        //   {
        //     key: 'state',
        //     placeholder: 'Filter by Province',
        //     options: selectOptions,
        //     onSelectChange: handleSelectChange,
        //   },
        // ]}
      />
    </div>
  );
}
