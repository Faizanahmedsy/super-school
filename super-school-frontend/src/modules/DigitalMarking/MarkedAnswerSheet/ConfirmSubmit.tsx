import { Button, Modal } from 'antd';
import { AlertTriangle, Lock } from 'lucide-react';
import { useState } from 'react';

const ConfirmSubmit = ({ onSubmit, title = 'Confirmation', content = 'Are you sure you want to proceed?' }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(5);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleOk = async () => {
    setIsLoading(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showConfirmModal = () => {
    let countdown = 5;
    setRemainingTime(countdown);
    setIsButtonDisabled(true);

    const timer = setInterval(() => {
      countdown -= 1;
      setRemainingTime(countdown);

      if (countdown === 0) {
        clearInterval(timer);
        setIsButtonDisabled(false);
      }
    }, 1000);

    Modal.confirm({
      title: (
        <div className="flex items-center">
          <AlertTriangle className="text-2xl text-yellow-500 mr-2" />
          <span className="font-bold text-lg">{title}</span>
        </div>
      ),
      content: (
        <div className="space-y-2">
          <p>{content}</p>
          <div className="flex items-center text-red-600">
            <Lock className="mr-2" />
            <strong>Warning: This action cannot be undone or changed later.</strong>
          </div>
        </div>
      ),
      centered: true,
      icon: null,
      okText: (
        <div className="flex items-center">
          Submit
          {remainingTime > 0 && <span className="ml-2 text-gray-500">({remainingTime}s)</span>}
        </div>
      ),
      okButtonProps: {
        loading: isLoading,
        disabled: isButtonDisabled,
        className: 'hover:!bg-green-500 hover:!border-green-500 hover:!text-white transition-all duration-300',
      },
      cancelButtonProps: {
        className: 'hover:!border-red-500 hover:!text-red-500 transition-all duration-300',
      },
      onOk: handleOk,
    });
  };

  return (
    <Button
      type="primary"
      onClick={showConfirmModal}
      className="bg-blue-500 hover:bg-blue-600 transition-all duration-300"
    >
      Open Confirmation Modal
    </Button>
  );
};

export default ConfirmSubmit;
