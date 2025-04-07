import { useListOption } from '@/hooks/use-select-option';
import { useParentList } from '@/services/management/parent/parent.hook';
import { Select } from 'antd';
import React from 'react';
import UIFormItemSelect from './v4/UIFormItem';

interface ParentsSelectProps {
  name: string;
}

const ParentSelect: React.FC<ParentsSelectProps> = ({ name }) => {
  const { data, isLoading, error } = useParentList({
    page: 1,
  });
  const { options } = useListOption({
    listData: data?.list,
    labelKey: 'parent_name',
    valueKey: 'id',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label="Select Parent">
        <Select placeholder="Loading institutes..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label="Select Parent">
        <Select placeholder="Error loading institutes" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <>
      <UIFormItemSelect label="Select Parent" name={name}>
        <Select placeholder="Select an parent" options={options} />
      </UIFormItemSelect>
    </>
  );
};

export default ParentSelect;
