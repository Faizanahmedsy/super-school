import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathRendererProps {
  question: string;
  answer: string;
  qNo: string;
  actualMarks: number;
}

const RenderMathsGen3: React.FC<MathRendererProps> = ({ question, answer, qNo, actualMarks }) => {
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
    if (isMathJaxLoaded && (question || answer)) {
      window.MathJax.typesetPromise?.()?.catch((err: Error) => {
        setError(`Failed to render math: ${err.message}`);
      });
    }
  }, [question, answer, isMathJaxLoaded]);

  const formatAnswer = (text: string) => {
    // Replace $\\ with $\n to handle line breaks
    let processedText = text.replace(/\$\s*\\/g, '$\n');

    // Replace all instances of \\ with \n for additional line breaks
    processedText = processedText.replace(/\\\\/g, '\n');

    // Split by newlines and wrap each line in math delimiters if not already present
    return processedText.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;

      // Check if the line starts with a dollar sign and remove it if it does
      const formattedLine = trimmedLine.startsWith('$') ? trimmedLine.slice(1, -1) : trimmedLine;

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
  );
};

export default RenderMathsGen3;
