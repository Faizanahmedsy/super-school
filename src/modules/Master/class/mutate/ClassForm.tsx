import { SelectCity } from '@/components/global/Form/SelectCity';
import { SelectState } from '@/components/global/Form/SelectState';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib';
import { useState } from 'react';

interface Props {
  form: FormInstance;
  handleSubmit: (values: any) => void;
}

const ClassForm = ({ form, handleSubmit }: Props) => {
  const [stateId, setStateId] = useState<number | undefined>(undefined);
  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <div className="grid md:grid-cols-4 gap-4">
        <Form.Item label="Class Name" name="class_name">
          <Input type="text" />
        </Form.Item>
        <Form.Item label="Address" name="address">
          <Input type="text" />
        </Form.Item>
        <Form.Item label="EMIS Number" name="registration_number">
          <Input type="text" />
        </Form.Item>
        <SelectState onChange={(value) => setStateId(value)} />
        <SelectCity state_id={stateId} />
      </div>
    </Form>
  );
};

export default ClassForm;
