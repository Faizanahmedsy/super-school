import { ManualReviewItem } from '@/modules/DigitalMarking/ManualReview/ManualReview.types';
import React, { useEffect, useState } from 'react';
import UIText from '../Text/UIText';
import { Badge } from 'antd';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathRendererProps {
  data?: ManualReviewItem;
  studentDetails?: any;
}

const RenderMathsGen2: React.FC<MathRendererProps> = ({ data, studentDetails }: any) => {
  const [isMathJaxLoaded, setIsMathJaxLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;

      window.MathJax = {
        tex: {
          inlineMath: [
            ['$', '$'],
            ['\\(', '\\)'],
          ],
          displayMath: [
            ['$$', '$$'],
            ['\\[', '\\]'],
          ],
          processEscapes: true,
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
        },
      };

      script.onload = () => setIsMathJaxLoaded(true);
      script.onerror = () => setError('Failed to load MathJax');
      document.head.appendChild(script);
    } else {
      setIsMathJaxLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isMathJaxLoaded && (data?.question || data?.answer)) {
      window.MathJax.typesetPromise?.()?.catch((err: Error) => {
        setError(`Failed to render math: ${err.message}`);
      });
    }
  }, [data?.question, data?.answer, isMathJaxLoaded]);

  const formatAnswer = (text: string | undefined) => {
    try {
      // Check if text is defined and is a string
      if (typeof text !== 'string') {
        console.error('Expected text to be a string but received:', typeof text);
        return null;
      }

      // Replace `$\\` with `$\n` to handle line breaks
      let processedText = text.replace(/\$\s*\\/g, '$\n');

      // Replace all instances of `\\` with `\n` for additional line breaks
      processedText = processedText.replace(/\\\\/g, '\n');

      // Split by newlines and wrap each line in math delimiters if not already present
      return processedText.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;

        // Wrap line with `$` if it doesn't start with it
        const formattedLine = trimmedLine.startsWith('$') ? trimmedLine : `$${trimmedLine}$`;

        return (
          <div key={index} className="py-1">
            {formattedLine}
          </div>
        );
      });
    } catch (error) {
      console.error('Error formatting answer:', error);
      return null;
    }
  };

  if (error) {
    return <div className="text-red-500 p-2 rounded-md bg-red-50">{error}</div>;
  }

  if (!isMathJaxLoaded) {
    return (
      <div className="animate-pulse bg-gray-100 h-8 rounded-md">
        <div className="sr-only">
          <UIText>Loading math renderer...</UIText>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-2">
      {/* Question Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-end mb-2">
          <Badge
            className={cn('px-2 rounded-2xl text-base', data?.teacher_reason != null && 'bg-green-200 text-black')}
          >
            {data?.teacher_reason != null && <>Reviewed</>}
          </Badge>
        </div>
        <div className="font-medium text-gray-700 mb-2 flex justify-between items-center gap-4">
          <div className="flex gap-1">
            <UIText>Question:</UIText>
            {data?.question_number}
          </div>
          <div className="flex gap-1">
            <UIText>Max Marks:</UIText> {data?.actual_mark}
          </div>
        </div>
        <div className="math-content flex justify-between items-center gap-4">
          <div>{data?.question}</div>
          <div className="min-w-fit flex gap-1">
            <UIText>Marks:</UIText>{' '}
            {data?.obtained_manual_mark != null ? data?.obtained_manual_mark : data?.obtained_mark}
          </div>
        </div>
      </div>

      {/* Answer Section */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="font-medium text-gray-700 mb-2">
          <UIText>Answer:</UIText>
        </div>
        <div className="math-content space-y-1 w-100">
          {studentDetails === 'Mathematics' ? formatAnswer(data?.answer) : data?.answer}
        </div>
      </div>
    </div>
  );
};

export default RenderMathsGen2;
