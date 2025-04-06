import { Card } from 'antd';
import React from 'react';
import UIText from '../../Text/UIText';

export default function UIFormContainerV4({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <>
      <Card className="mb-5 border-none">
        <div className="justify-between items-center pb-10">
          <div className="flex items-center text-2xl font-medium text-slate-600 mb-5">
            <div>
              <UIText>{title}</UIText>
            </div>
          </div>

          {children}
        </div>
      </Card>
    </>
  );
}
