import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from 'antd';

const MultiStepFormContainer = ({
  title,
  currentStep,
  setCurrentStep,
  totalSteps,
  children,
  onFinish,
  extraItems,
}: any) => {
  const [form] = Form.useForm();

  const handleNext = async () => {
    try {
      await form.validateFields();
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      onFinish?.(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-medium text-slate-600">{title}</CardTitle>
            {extraItems && <div className="flex gap-4">{extraItems}</div>}
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center mt-6">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`w-20 h-1 ${index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Form form={form} layout="vertical" className="mt-6">
            {children}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                Previous
              </Button>

              {currentStep === totalSteps ? (
                <Button onClick={handleFinish}>Finish</Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiStepFormContainer;
