import { Button } from '@/components/ui/button';
import { Form, Input, Select } from 'antd';
import { useState } from 'react';
import MultiStepFormContainer from './MultiStepFormContainer';

const CategoryForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleFinish = (values: any) => {};

  const extraItems = (
    <>
      <Button variant="outline">Save as Draft</Button>
      <Button>Create Category</Button>
    </>
  );

  return (
    <MultiStepFormContainer
      title="Create A Category"
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      totalSteps={totalSteps}
      onFinish={handleFinish}
      extraItems={extraItems}
    >
      {currentStep === 1 && (
        <div className="space-y-6">
          <Form.Item
            label="Category Name"
            name="categoryName"
            rules={[{ required: true, message: 'Please input category name!' }]}
          >
            <Input placeholder="category name" />
          </Form.Item>

          <Form.Item label="Slug" name="slug" rules={[{ required: true, message: 'Please input slug!' }]}>
            <Input placeholder="slug" />
          </Form.Item>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <Form.Item label="Parent Category" name="parentCategory">
            <Select placeholder="Select...">
              <Select.Option value="category1">Category 1</Select.Option>
              <Select.Option value="category2">Category 2</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Display Type" name="displayType">
            <Select placeholder="Select...">
              <Select.Option value="type1">Type 1</Select.Option>
              <Select.Option value="type2">Type 2</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </div>
      )}
    </MultiStepFormContainer>
  );
};

export default CategoryForm;
