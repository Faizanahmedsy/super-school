import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import { SelectCity } from '@/components/global/Form/SelectCity';
import SelectLocationType from '@/components/global/Form/SelectLocationType';
import SelectMediumOfInstruction from '@/components/global/Form/SelectMediumOfInstruction';
import SelectSchoolType from '@/components/global/Form/SelectSchoolType';
import { SelectState } from '@/components/global/Form/SelectState';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { Card, Form, Input } from 'antd';
import { FormInstance } from 'antd/lib';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  form: FormInstance;
  handleSubmit: (values: any) => void;
  editMode: boolean;
  apiMutation: any;
  provinceID?: number;
}

const InstituteFormStep = ({ form, handleSubmit, editMode, apiMutation, provinceID }: Props) => {
  const [stateId, setStateId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (provinceID) {
      setStateId(provinceID);
    }
  }, [provinceID]);

  const navigate = useNavigate();

  const handleSubmitData = async () => {
    try {
      const values = await form.validateFields();
      handleSubmit(values);
    } catch (error) {
      console.log('Form Validation Failed:', error);
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      handleSubmit(values);
    } catch (error) {
      console.log('Form Validation Failed:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <>
      <Card className="mb-5">
        <div className="justify-between items-center pb-10">
          <div className="flex items-center text-2xl font-medium text-slate-600 mb-5">
            <div>
              <UIText>School Details</UIText>
            </div>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CustomFormItem
                label="School Name"
                name="school_name"
                rules={[
                  {
                    required: true,
                    message: requireMessage('school name'),
                  },
                ]}
              >
                <Input type="text" placeholder="Enter School Name" />
              </CustomFormItem>

              <SelectSchoolType />

              <CustomFormItem
                label="EMIS Number"
                name="EMIS_number"
                rules={[
                  {
                    required: true,
                    message: requireMessage('EMIS number'),
                  },
                ]}
              >
                <Input type="text" placeholder="Enter EMIS Number" />
              </CustomFormItem>

              <CustomFormItem
                label="Maximum Users"
                name="max_users"
                rules={[
                  {
                    required: true,
                    message: requireMessage('maximum users'),
                  },
                  {
                    pattern: /^[0-9]*$/,
                    message: 'Only numbers are allowed',
                  },
                ]}
              >
                <Input type="number" placeholder="Enter Maximum Users" />
              </CustomFormItem>

              <SelectMediumOfInstruction />
              <SelectLocationType />

              <SelectState onChange={(value) => setStateId(value)} />
              <SelectCity state_id={stateId} />
              <CustomFormItem
                label="Address"
                name="address"
                rules={[
                  {
                    required: true,
                    message: requireMessage('address'),
                  },
                ]}
              >
                <Input.TextArea rows={4} placeholder="Enter Address" />
              </CustomFormItem>
            </div>

            <div className="flex items-center text-2xl font-medium text-slate-600 mb-5">
              <div>
                <UIText>Principal Details</UIText>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <CustomFormItem
                label="Name"
                name="contact_person"
                rules={[
                  {
                    required: true,
                    message: requireMessage('principal name'),
                  },
                ]}
              >
                <Input type="text" placeholder="Please enter the name" />
              </CustomFormItem>

              <CustomFormItem
                label="Contact Number"
                name="contact_number"
                rules={[
                  { required: true, message: requireMessage('contact number') },
                  {
                    validator: (_: any, value: any) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      if (!/^\d+$/.test(value)) {
                        return Promise.reject('Please enter numbers only');
                      }
                      if (value.length < 10) {
                        return Promise.reject('Contact number must be at least 10 digits');
                      }
                      if (value.length > 15) {
                        return Promise.reject('Contact number cannot exceed 15 digits');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Enter Contact Number"
                  maxLength={15}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </CustomFormItem>
              <CustomFormItem
                label="Email"
                name="contact_email"
                rules={[
                  {
                    required: true,
                    message: requireMessage('email'),
                  },
                  {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Please enter a valid email',
                  },
                ]}
              >
                <Input type="text" placeholder="Please enter the email" />
              </CustomFormItem>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleCancel} className="mr-4" variant={'nsc-secondary'} type="button">
                Cancel
              </Button>

              {editMode ? (
                <UIFormSubmitButton type="button" onClick={handleSubmitData} api={apiMutation}>
                  Update
                </UIFormSubmitButton>
              ) : (
                <UIFormSubmitButton api={apiMutation} type="button" onClick={handleNext}>
                  Next
                </UIFormSubmitButton>
              )}
            </div>
          </Form>
        </div>
      </Card>
    </>
  );
};

export default InstituteFormStep;
