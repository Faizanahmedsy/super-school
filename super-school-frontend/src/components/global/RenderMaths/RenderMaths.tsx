import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathRendererProps {
  question: string;
  answer: string;
  actualMarks: number;
  qNo: string;
}

const RenderMaths: React.FC<MathRendererProps> = ({ question, answer, actualMarks, qNo }) => {
  const [isMathJaxLoaded, setIsMathJaxLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load MathJax
    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;

      // Configure MathJax
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
    if (isMathJaxLoaded && (question || answer)) {
      window.MathJax.typesetPromise?.()?.catch((err: Error) => {
        setError(`Failed to render math: ${err.message}`);
      });
    }
  }, [question, answer, isMathJaxLoaded]);

  const formatAnswer = (text: string) => {
    // Split by newlines and wrap each line in math delimiters if not already present
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;

      // If line doesn't start with $, wrap it
      const formattedLine = trimmedLine.startsWith('$') ? trimmedLine : `$${trimmedLine}$`;

      return (
        <div key={index} className="py-1">
          {formattedLine}
        </div>
      );
    });
  };

  if (error) {
    return <div className="text-red-500 p-2 rounded-md bg-red-50">{error}</div>;
  }

  if (!isMathJaxLoaded) {
    return (
      <div className="animate-pulse bg-gray-100 h-8 rounded-md">
        <div className="sr-only">Loading math renderer...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Question Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="font-medium text-gray-700 mb-2 flex justify-between items-center">
          <div>Question: {qNo}</div>
          <div>Max Marks: {actualMarks}</div>
        </div>
        <div className="math-content">{question}</div>
      </div>

      {/* Answer Section */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="font-medium text-gray-700 mb-2">Solution:</div>
        <div className="math-content space-y-1">{formatAnswer(answer)}</div>
      </div>
    </div>
    // <div className="space-y-4">
    //   {/* Question Section */}
    //   <div className="bg-gray-50 p-4 rounded-lg">
    //     <div className="font-medium text-gray-700 mb-2">Question:</div>
    //     <div className="math-content">{question}</div>
    //   </div>

    //   {/* Answer Section */}
    //   <div className="bg-white border border-gray-200 p-4 rounded-lg">
    //     <div className="font-medium text-gray-700 mb-2">Solution:</div>
    //     <div className="math-content space-y-1">{formatAnswer(answer)}</div>
    //   </div>
    // </div>
  );
};

export default RenderMaths;
