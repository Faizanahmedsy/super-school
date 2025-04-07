// components/BatchCard.tsx

import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChevronRightIcon, FolderIcon } from 'lucide-react';
import * as React from 'react';

interface BatchCardProps {
  title?: string;
  subtitle?: string;
  link?: string;
  componentName?: string;
  lightColor?: string;
  color?: string;
  description?: string;
  onClick: () => void;
}

const UiCardV1: React.FC<BatchCardProps> = ({
  title,
  subtitle,
  description,
  componentName,
  onClick,
  lightColor,
  color,
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="relative overflow-hidden cursor-pointer group" onClick={onClick}>
        <div className={`absolute inset-0 ${lightColor} transition-opacity duration-300 group-hover:opacity-0`} />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        />

        <CardHeader className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${lightColor} group-hover:bg-white/20 transition-colors duration-300`}>
              <FolderIcon className="w-6 h-6 text-gray-700 group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                {/* <IntlMessages id={`batch.name`} /> {title} */}
                {title}
              </h3>
            </div>
          </div>
        </CardHeader>

        <CardFooter className="relative z-10">
          <div className="w-full flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm text-gray-600 group-hover:text-white/70 transition-colors duration-300">
                {subtitle}
              </p>
              <p className="text-sm font-medium text-gray-900 group-hover:text-white transition-colors duration-300">
                {/* {description} */}
              </p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300 transform group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default UiCardV1;
