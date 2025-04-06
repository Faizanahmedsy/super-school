import { Select } from 'antd';
import { useState } from 'react';
import UIFormItemSelect from './v4/UIFormItem';
import { requireMessage } from '@/lib/form_validations/formmessage';
import UIText from '../Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UISelect from './v4/UISelect';

const SelectSchoolType = ({ ...props }: object) => {
  const [selectedValue, setSelectedValue] = useState<string>();

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };
  return (
    <>
      <UIFormItemSelect
        label="Select School Type"
        name="school_type"
        rules={[{ required: true, message: requireMessage('school type', 'select') }]}
        {...props}
      >
        <UISelect value={selectedValue} onChange={handleChange} placeholder="Select School Type">
          <Select.Option value="public">Public</Select.Option>
          <Select.Option value="private">Private</Select.Option>
        </UISelect>
      </UIFormItemSelect>
    </>
  );
};

export default SelectSchoolType;
