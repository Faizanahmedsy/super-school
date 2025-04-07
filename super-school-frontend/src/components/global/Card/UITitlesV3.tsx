import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChevronRightIcon, Trash2 } from 'lucide-react';
import React from 'react';

type ReusableCardProps = {
  title: string;
  color?: string; // Base gradient color (e.g., 'from-teal-400 to-teal-500')
  lightColor?: string; // Background light color (e.g., 'bg-teal-200')
  onClick?: () => void;
  onDelete?: () => void;
  footer?: string | React.ReactNode;
  active?: boolean; // Added for active card status
};

export const UITitlesV3 = ({
  title,
  color,
  lightColor,
  onClick,
  onDelete,
  footer,
  active, // Default to false
}: ReusableCardProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        className={`relative overflow-hidden cursor-pointer group z-5 
          ${active ? 'bg-[#3DB047] hover:bg-[#1B7C22]' : 'bg-slate-400 hover:bg-slate-500'}`} // Conditional background
        onClick={onClick}
      >
        {/* Base solid color background */}
        <div className={`absolute inset-0 ${lightColor}`} />

        {/* Gradient overlay on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Delete Button */}
        {onDelete && (
          <div
            className="absolute top-3 right-3 z-20"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <div className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        <CardHeader className="relative z-10 mb-4">
          <div className="flex items-center space-x-4">
            {/* <div className="p-3 rounded-lg bg-white/20">
              <FolderIcon className="w-6 h-6 text-white" />
            </div> */}
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
          </div>
        </CardHeader>

        <CardFooter className="relative z-10">
          {footer && (
            <div className="flex justify-between text-sm text-white w-full">
              {footer}
              <ChevronRightIcon className="w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          )}
          {/* <div className="w-full flex justify-end items-center"></div> */}
        </CardFooter>
      </Card>
    </motion.div>
  );
};
