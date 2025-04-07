import { requireMessage } from '@/lib/form_validations/formmessage';
import { Select } from 'antd';
import { useState } from 'react';
import UIFormItemSelect from './v4/UIFormItem';
import UISelect from './v4/UISelect';

const SelectMediumOfInstruction = ({ ...props }: object) => {
  const [selectedValue, setSelectedValue] = useState<string>();

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };
  return (
    <>
      <UIFormItemSelect
        label="Select Medium Of Instruction"
        name="medium_of_instruction"
        rules={[{ required: true, message: requireMessage('medium of instruction', 'select') }]}
        {...props}
      >
        <UISelect value={selectedValue} onChange={handleChange} placeholder="Select Medium Of Instruction">
          <Select.Option value="english">English</Select.Option>
          <Select.Option value="afrikaans">Afrikaans</Select.Option>
          <Select.Option value="isizulu">IsiZulu</Select.Option>
        </UISelect>
      </UIFormItemSelect>
    </>
  );
};

export default SelectMediumOfInstruction;
