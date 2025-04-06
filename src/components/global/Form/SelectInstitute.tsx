import { useListOption } from '@/hooks/use-select-option';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { Select } from 'antd';
import React from 'react';
import UIFormItemSelect from './v4/UIFormItem';
import { requireMessage } from '@/lib/form_validations/formmessage';

interface InstituteSelectProps {
  name: string;
}

const InstituteSelect: React.FC<InstituteSelectProps> = ({ name }) => {
  const [_, setSelectChange] = React.useState<number | undefined>(undefined);
  const { data, isLoading, error } = useInstituteList({});

  const { options } = useListOption({
    listData: data?.list,
    labelKey: 'school_name',
    valueKey: 'id',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label="Select School">
        <Select placeholder="Loading institutes..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label="Select School">
        <Select placeholder="Error loading institutes" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <>
      <UIFormItemSelect
        label="Select School"
        name={name}
        rules={[{ required: true, message: requireMessage('school') }]}
      >
        <Select
          allowClear
          showSearch
          filterOption={(input, option) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          placeholder="Select an School"
          options={options}
          onChange={(value) => setSelectChange(value)}
        />
      </UIFormItemSelect>
    </>
  );
};

export default InstituteSelect;
