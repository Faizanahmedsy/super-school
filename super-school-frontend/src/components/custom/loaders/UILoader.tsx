import loadingAnimation from '@/assets/lottie/lottie-loading-1.json';
import Lottie from 'lottie-react';

export default function UILoader() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-44 h-44">
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
    </div>
  );
}
