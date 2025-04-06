'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

const CopyBtn = ({ copyText }: { copyText: any }) => {
  const [copied, setCopied] = useState(false);
  const variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 0.5 },
  };

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  }, [copied]);

  return (
    <motion.button
      whileTap={{ scale: 1, opacity: 1 }}
      onClick={() => {
        navigator.clipboard.writeText(copyText);
        setCopied(!copied);
      }}
      className="rounded-lg border border-gray-100  px-1 m-2 text-black"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="checkmark" variants={variants} initial="hidden" animate="visible" exit="hidden">
            <Check size={20} color="green" />
          </motion.span>
        ) : (
          <motion.span key="copy" variants={variants} initial="hidden" animate="visible" exit="hidden">
            <Copy size={20} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default CopyBtn;
