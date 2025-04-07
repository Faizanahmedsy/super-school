import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';
import React from 'react';
import UIText from '../global/Text/UIText';

type Size = 'sm' | 'md' | 'lg';

interface SizeConfig {
  wrapper: string;
  icon: string;
  text: string;
}

interface NoDataFoundProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: Size;
  className?: string;
}

const sizeConfigs: Record<Size, SizeConfig> = {
  sm: {
    wrapper: 'py-4',
    icon: 'w-8 h-8',
    text: 'text-sm',
  },
  md: {
    wrapper: 'py-8',
    icon: 'w-12 h-12',
    text: 'text-base',
  },
  lg: {
    wrapper: 'py-16',
    icon: 'w-16 h-16',
    text: 'text-lg',
  },
} as const;

// const fadeInAnimation: Variants = {
//   initial: { opacity: 0, y: 10 },
//   animate: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.4,
//       ease: 'easeInOut',
//     },
//   },
// };

// const iconAnimation: Variants = {
//   initial: { scale: 1 },
//   animate: {
//     scale: 1.05,
//     transition: {
//       duration: 2,
//       repeat: Infinity,
//       repeatType: 'reverse',
//       ease: 'easeInOut',
//     },
//   },
// };

export default function UINoDataFound({ size = 'md', className, ...props }: NoDataFoundProps) {
  const sizeConfig = sizeConfigs[size];

  return (
    <div
      className={cn('flex flex-col items-center justify-center w-full px-4', sizeConfig.wrapper, className)}
      // initial="initial"
      // animate="animate"
      // variants={fadeInAnimation}
      {...props}
    >
      <div
        // variants={iconAnimation}
        className={cn(' bg-gray-50 rounded-full p-3')}
      >
        <Inbox className={cn('text-gray-400 stroke-[1.5]', sizeConfig.icon)} />
      </div>

      <div className="text-center">
        <p className={cn('font-medium text-gray-700', sizeConfig.text)}>
          <UIText>No Data Found</UIText>
        </p>
        <p className={cn('text-gray-500', size === 'sm' ? 'text-xs' : 'text-sm')}>
          <UIText>There's nothing to display at the moment</UIText>
        </p>
      </div>
    </div>
  );
}
