import { Card } from 'antd';
import React from 'react';

export default function UIFormContainerV2({
  title,
  extraItem,
  children,
}: {
  title: string;
  extraItem?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Card>
        <div className="flex justify-between items-center pb-10">
          <div className="flex items-center text-2xl font-medium text-slate-600">
            <div>{title}</div>
          </div>
          {extraItem && <div className="flex gap-5">{extraItem}</div>}
        </div>
        {children}
      </Card>
    </div>
  );
}
