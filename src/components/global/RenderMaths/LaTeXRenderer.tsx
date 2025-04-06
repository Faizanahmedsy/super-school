import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const LaTeXRenderer = ({ equation }: any) => {
  const renderedEquation = React.useMemo(() => {
    try {
      return katex.renderToString(equation, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (e) {
      console.error(`Error rendering LaTeX equation: ${equation}`, e);
      return 'Error rendering LaTeX';
    }
  }, [equation]);

  return <div className="latex-equation" dangerouslySetInnerHTML={{ __html: renderedEquation }} />;
};

export default LaTeXRenderer;
