import React from 'react';

export default function UIFormCardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center text-2xl font-medium text-slate-600 mb-5">
      <div>{children}</div>
    </div>
  );
}
