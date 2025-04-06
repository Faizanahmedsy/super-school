import { Construction, Wrench, HardHat } from 'lucide-react';
import { useState, useEffect } from 'react';

const UnderConstruction = () => {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounce((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100dvh-150px)] flex items-center justify-center p-4">
      <div className="text-center space-y-10 max-w-2xl mx-auto">
        {/* Icon Container */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12">
            <HardHat size={48} className="text-yellow-500 animate-bounce" />
          </div>
          <div className="flex justify-center gap-4">
            <Construction
              size={64}
              className={`text-yellow-600 transform ${
                bounce ? 'rotate-12' : '-rotate-12'
              } transition-transform duration-500`}
            />
            <Wrench
              size={64}
              className={`text-gray-600 transform ${
                bounce ? '-rotate-12' : 'rotate-12'
              } transition-transform duration-500`}
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Under Construction</h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            We're working hard to bring you something amazing. Please check back soon!
          </p>
        </div>

        {/* Contact Info - Optional */}
        <p className="text-sm text-gray-500">Thank you for your patience!</p>
      </div>
    </div>
  );
};

export default UnderConstruction;
