import AppPageMeta from '@/app/components/AppPageMeta';
import IntlMessages from '@/app/helpers/IntlMessages';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { convertToCamelCase } from '@/lib/common-functions';
import { cn } from '@/lib/utils';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UIText from './Text/UIText';

type BreadcrumbItemType = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type Props = {
  children?: React.ReactNode;
  className?: string;
  extraItem?: React.ReactNode;
  breadcrumbs?: BreadcrumbItemType[];
  titleId?: string;
  titleModule?: string;
};

export default function PageTitle({ children, className, extraItem, breadcrumbs }: Props) {
  const navigate = useNavigate();
  return (
    <>
      <AppPageMeta title={typeof children === 'string' ? children : ''} />

      <div className="flex flex-wrap w-full justify-between mb-4">
        <div>
          <h3 className={cn('font-semibold text-black-500 text-xl md:text-3xl mb-2', className)}>
            <IntlMessages id={`page-title.${convertToCamelCase(children?.toString() || '')}`} />
          </h3>

          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs &&
                breadcrumbs.map((breadcrumb, index) => (
                  <BreadcrumbItem key={index}>
                    {breadcrumb.href ? (
                      <div
                        className="text-sm text-slate-500 cursor-pointer"
                        onClick={() => {
                          if (breadcrumb.onClick) {
                            breadcrumb.onClick();
                          } else {
                            breadcrumb.href && navigate(breadcrumb.href);
                          }
                        }}
                      >
                        <IntlMessages id={`page-title.${convertToCamelCase(breadcrumb.label)}`} />
                      </div>
                    ) : (
                      <BreadcrumbPage>
                        <UIText>{breadcrumb.label}</UIText>
                      </BreadcrumbPage>
                    )}
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {extraItem && <div className="ml-4">{extraItem}</div>}
      </div>
    </>
  );
}
