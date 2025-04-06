import { Select } from 'antd';
import { useState } from 'react';
import UIFormItemSelect from './v4/UIFormItem';
import { requireMessage } from '@/lib/form_validations/formmessage';
import UIText from '../Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UISelect from './v4/UISelect';

const SelectLocationType = ({ ...props }: object) => {
  const [selectedValue, setSelectedValue] = useState<string>();

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };
  return (
    <>
      <UIFormItemSelect
        label="Select Location Type"
        name="location_type"
        rules={[{ required: true, message: requireMessage('location type', 'select') }]}
        {...props}
      >
        <UISelect value={selectedValue} onChange={handleChange} placeholder="Select Location Type">
          <Select.Option value="InSchool">In School</Select.Option>
          <Select.Option value="AtDifferentLocation">At Different Location</Select.Option>
        </UISelect>
      </UIFormItemSelect>
    </>
  );
};

export default SelectLocationType;
