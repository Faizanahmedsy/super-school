import { useListOption } from '@/hooks/use-select-option';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { Select } from 'antd';
import React from 'react';
import UIFormItemSelect from './v4/UIFormItem';

interface InstituteSelectProps {
  name: string;
}

const SelectSchool: React.FC<InstituteSelectProps> = ({ name }) => {
  const { data, isLoading, error } = useInstituteList({});

  const { options } = useListOption({
    listData: data?.list,
    labelKey: 'school_name',
    valueKey: 'id',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label="Select School" name={name}>
        <Select placeholder="Loading School..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label="Select School" name={name}>
        <Select placeholder="Error loading School" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <>
      <UIFormItemSelect label="Select School" name={name}>
        <Select placeholder="Select an School" options={options} />
      </UIFormItemSelect>
    </>
  );
};

export default SelectSchool;
