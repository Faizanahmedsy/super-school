import { useListOption } from '@/hooks/use-select-option';
import { useUserroleList } from '@/services/userrole/userrole.actions';
import { Select } from 'antd';
import React from 'react';
import UIFormItemSelect from './v4/UIFormItem';

interface ModuleSelectProps {
  name: string;
}

const RoleSelect: React.FC<ModuleSelectProps> = ({ name }) => {
  const { data, isLoading, error } = useUserroleList({
    page: 1,
  });

  const { options } = useListOption({
    listData: data?.list,
    labelKey: 'role_name',
    valueKey: 'id',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label="Select UserRole">
        <Select placeholder="Loading UserRole..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label="Select UserRole">
        <Select placeholder="Error loading UserRole" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <>
      <UIFormItemSelect label="Select UserRole" name={name}>
        <Select placeholder="Select an UserRole" options={options} />
      </UIFormItemSelect>
    </>
  );
};

export default RoleSelect;
