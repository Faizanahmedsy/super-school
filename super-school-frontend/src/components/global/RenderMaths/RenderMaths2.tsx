import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

const RenderMaths2 = ({ latexString }: any) => {
  // Split by line breaks for multiple lines of expressions
  const expressions = latexString
    .split('$\\')
    .map((expr: any) => expr.trim())
    .filter((expr: any) => expr);

  return (
    <div>
      {expressions.map((expr: any, index: number) => (
        <BlockMath key={index} math={expr} />
      ))}
    </div>
  );
};

export default RenderMaths2;
