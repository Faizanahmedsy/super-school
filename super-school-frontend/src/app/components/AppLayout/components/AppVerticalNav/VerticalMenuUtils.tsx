import React from 'react';
import { Link } from 'react-router-dom';

import { allowMultiLanguage } from '@/app/constants/AppConst';
import { useIntl } from 'react-intl';

// NSC SIDEBAR MENU ITEM BUTTON

const MenuItemChildren = (item: any) => {
  const { icon, messageId, url } = item;
  const { messages } = useIntl();

  const iconElement =
    icon &&
    (React.isValidElement(icon) ? (
      <span id={url} className="ant-menu-item-icon">
        {icon}
      </span>
    ) : (
      React.createElement(icon, { id: url, className: 'ant-menu-item-icon' })
    ));

  const labelElement = allowMultiLanguage ? messages[messageId] : item.title;

  if (url && url.includes('/')) {
    return {
      icon: iconElement,
      label: (
        <Link to={url} id={url}>
          <span data-testid={messageId.toLowerCase() + '-nav'}>{labelElement}</span>
          {/* //TODO - Add notification bubble with count*/}
        </Link>
      ),
    };
  } else {
    return {
      icon: iconElement,
      label: (
        <span id={url} data-testid={messageId.toLowerCase() + '-nav'}>
          {labelElement}
        </span>
      ),
    };
  }
};

const MenuItemChildrenComponent = ({ item }: { item: any }) => {
  const { icon, messageId, url } = item;
  const { messages } = useIntl(); // ✅ Hook is always called

  const iconElement = icon ? (
    React.isValidElement(icon) ? (
      <span id={url} className="ant-menu-item-icon">
        {icon}
      </span>
    ) : (
      React.createElement(icon, { id: url, className: 'ant-menu-item-icon' })
    )
  ) : null;

  const labelElement = allowMultiLanguage ? messages[messageId] : item.title;

  return url && url.includes('/')
    ? {
        icon: iconElement,
        label: (
          <Link to={url} id={url}>
            <span data-testid={messageId.toLowerCase() + '-nav'}>{labelElement}</span>
          </Link>
        ),
      }
    : {
        icon: iconElement,
        label: (
          <span id={url} data-testid={messageId.toLowerCase() + '-nav'}>
            {labelElement}
          </span>
        ),
      };
};

const renderMenuItem = (item: any) => {
  return item.type === 'collapse'
    ? {
        key: item.title,
        ...MenuItemChildrenComponent({ item }), // ✅ Pass item as a prop
        children: item.children.map(renderMenuItem),
        type: 'collapse',
      }
    : {
        key: item.title,
        ...MenuItemChildrenComponent({ item }), // ✅ Pass item as a prop
      };
};

// const renderMenu = (item) => {
//   return item.type === 'group'
//     ? {
//         key: item.url ? item.url : item.id,
//         id: item.url,
//         ...MenuItemChildren(item),
//         children: item.children.map((item) => renderMenuItem(item)),
//         type: 'group',
//       }
//     : {
//         key: item.id,
//         id: item.url,
//         exact: item.exact,
//         ...MenuItemChildren(item),
//       };
// };

const renderMenu = (item: any) => {
  return item.type === 'group'
    ? {
        key: item.url ? item.url : item.id,
        ...MenuItemChildren(item),
        children: item.children.map((item: any) => renderMenuItem(item)),
        type: 'group',
      }
    : item.type == 'collapse'
      ? {
          key: item.title,
          ...MenuItemChildren(item),
          children: item.children.map((item: any) => renderMenuItem(item)),
          type: 'collapse',
        }
      : {
          key: item.title,
          exact: item.exact,
          ...MenuItemChildren(item),
        };
};

export const getRouteMenus = (routesConfig: any) => {
  return routesConfig.map((route: any) => renderMenu(route));
};
