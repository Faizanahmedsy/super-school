import loadingAnimation from '@/assets/lottie/lottie-loading-1.json';
import Lottie from 'lottie-react';

export default function TileLoader() {
  return (
    <div className="flex items-center justify-center col-span-full min-h-72">
      <div className="w-44 h-44">
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
    </div>
  );
}
