// import React, { useState } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// const MathRenderer = () => {
//   const [customExpression, setCustomExpression] = useState('');

//   // Complex sample expressions with descriptions
//   const expressions = [
//     {
//       latex: '\\int_{0}^{\\infty} \\frac{x^3}{e^x - 1} dx = \\frac{\\pi^4}{15}',
//       description: 'Definite integral related to Riemann zeta function'
//     },
//     {
//       latex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}',
//       description: 'Basel problem solution'
//     },
//     {
//       latex: '\\frac{d}{dx}\\left[ \\sqrt{x^2 + \\frac{1}{x^2}} \\right] = \\frac{x^2 - \\frac{1}{x^2}}{\\sqrt{x^2 + \\frac{1}{x^2}}}',
//       description: 'Complex derivative using chain rule'
//     },
//     {
//       latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}',
//       description: 'Matrix multiplication'
//     },
//     {
//       latex: 'e^{i\\pi} + 1 = 0',
//       description: 'Euler\'s identity'
//     },
//     {
//       latex: '\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1',
//       description: 'Famous trigonometric limit'
//     },
//     {
//       latex: '\\oint_C \\frac{1}{z-z_0} dz = 2\\pi i \\cdot n(C,z_0)',
//       description: 'Cauchy\'s integral formula'
//     },
//     {
//       latex: '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}',
//       description: 'Maxwell\'s equation (Faraday\'s law)'
//     },
//     {
//       latex: '\\frac{\\partial^2 u}{\\partial t^2} = c^2\\left(\\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} + \\frac{\\partial^2 u}{\\partial z^2}\\right)',
//       description: '3D Wave equation'
//     },
//     {
//       latex: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!} = \\frac{n(n-1)\\cdots(n-k+1)}{k!}',
//       description: 'Binomial coefficient expansion'
//     }
//   ];

//   // Function to load KaTeX from CDN and render math
//   const renderMathExpression = (expression) => {
//     return (
//       <div
//         className="p-4 bg-gray-50 rounded-lg my-2 text-lg"
//         dangerouslySetInnerHTML={{
//           __html: window.katex.renderToString(expression, {
//             throwOnError: false,
//             displayMode: true
//           })
//         }}
//       />
//     );
//   };

//   // Effect to load KaTeX
//   React.useEffect(() => {
//     const loadKaTeX = async () => {
//       // Load KaTeX CSS
//       const link = document.createElement('link');
//       link.rel = 'stylesheet';
//       link.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
//       document.head.appendChild(link);

//       // Load KaTeX JS
//       const script = document.createElement('script');
//       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
//       script.async = true;
//       document.body.appendChild(script);
//     };

//     loadKaTeX();
//   }, []);

//   return (
//     <Card className="w-full max-w-3xl">
//       <CardHeader>
//         <CardTitle>LaTeX Math Renderer</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Tabs defaultValue="examples">
//           <TabsList className="mb-4">
//             <TabsTrigger value="examples">Example Formulas</TabsTrigger>
//             <TabsTrigger value="custom">Try Your Own</TabsTrigger>
//           </TabsList>

//           <TabsContent value="examples">
//             <div className="space-y-6">
//               {expressions.map((expr, index) => (
//                 <div key={index} className="border-b pb-4 last:border-b-0">
//                   <div className="font-medium text-sm text-gray-600 mb-1">{expr.description}</div>
//                   <div className="text-sm font-mono bg-gray-100 p-2 rounded mb-2">
//                     LaTeX: {expr.latex}
//                   </div>
//                   {typeof window !== 'undefined' && window.katex && renderMathExpression(expr.latex)}
//                 </div>
//               ))}
//             </div>
//           </TabsContent>

//           <TabsContent value="custom">
//             <div className="space-y-4">
//               <Input
//                 type="text"
//                 placeholder="Enter LaTeX expression"
//                 value={customExpression}
//                 onChange={(e) => setCustomExpression(e.target.value)}
//                 className="mb-2"
//               />
//               {customExpression && typeof window !== 'undefined' && window.katex &&
//                 renderMathExpression(customExpression)}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// };

// export default MathRenderer;
