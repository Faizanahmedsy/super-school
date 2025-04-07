import React from 'react';

import { CheckCircle, Circle } from 'lucide-react';
import { StyledNotifyListItem } from './NotificationItem.styled';
import { cn } from '@/lib/utils';
import { List } from 'antd';

type NotificationItemProps = {
  item: {
    title: string;
    message: string;
    is_read: boolean;
  };
};

const NotificationItem: React.FC<NotificationItemProps> = ({ item }) => {
  return (
    <StyledNotifyListItem className="item-hover ">
      <List.Item.Meta
        title={
          <div className="flex items-center gap-2 ">
            {item.title}
            {item?.is_read ? (
              <CheckCircle className={cn('w-4 h-4', 'text-green-500')} /> // Green dot
            ) : (
              <Circle className={cn('w-4 h-4', 'text-blue-500')} /> // Blue dot
            )}
          </div>
        }
        description={
          item.message.split(' ').length > 12 ? item.message.split(' ').slice(0, 12).join(' ') + '...' : item.message
        }
      />
      {/* <ListItem key={item.message} title={item.title} message={item.message} isRead={item.isRead} /> */}
    </StyledNotifyListItem>
  );
};

//TODO: USE THIS LATER
// interface ListItemProps {
//   title: string;
//   message: string;
//   isRead: boolean;
// }

// const ListItem: React.FC<ListItemProps> = ({ title, message, isRead }) => {
//   return (
//     <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-start gap-4">
//       {/* Status Icon */}
//       <div className="shrink-0">
//         {isRead ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-blue-500" />}
//       </div>

//       {/* Content */}
//       <div className="flex flex-col">
//         <h3 className=" font-semibold text-gray-800 flex items-center gap-2">{title}</h3>
//         <p className="text-sm text-gray-600 mt-1">{message}</p>
//       </div>
//     </div>
//   );
// };

export default NotificationItem;
