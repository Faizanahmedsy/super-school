import { useListOption } from '@/hooks/use-select-option';
import { useModuleList } from '@/services/module/module.hook';
import { Select } from 'antd';
import React from 'react';
import UIFormItemSelect from './v4/UIFormItem';

interface ModuleSelectProps {
  name: string;
}

const ModuleSelect: React.FC<ModuleSelectProps> = ({ name }) => {
  const { data, isLoading, error } = useModuleList({
    page: 1,
  });

  const { options } = useListOption({
    listData: data,
    labelKey: 'module_name',
    valueKey: 'id',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label="Select Module">
        <Select placeholder="Loading module..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label="Select Module">
        <Select placeholder="Error loading module" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <>
      <UIFormItemSelect label="Select Module" name={name}>
        <Select placeholder="Select an Module" options={options} />
      </UIFormItemSelect>
    </>
  );
};

export default ModuleSelect;
