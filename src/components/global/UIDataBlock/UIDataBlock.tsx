import React from 'react';

export default function UIDataBlock({ title, data }: { title: string; data: string | undefined }) {
  return (
    <>
      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
        <div className="text-sm text-gray-500 mb-1">{title}</div>
        <div className="text-gray-900">{data ? data : '-'}</div>
      </div>
    </>
  );
}
