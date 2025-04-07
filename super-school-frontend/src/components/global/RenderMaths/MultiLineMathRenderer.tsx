// import React from "react";

// const MultiLineMathRenderer = ({ expression }) => {
//   const [isKatexLoaded, setIsKatexLoaded] = React.useState(false);

//   React.useEffect(() => {
//     // Load KaTeX CSS
//     if (!document.querySelector("#katex-css")) {
//       const link = document.createElement("link");
//       link.id = "katex-css";
//       link.rel = "stylesheet";
//       link.href =
//         "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
//       document.head.appendChild(link);
//     }

//     // Load KaTeX JS
//     if (!window.katex) {
//       const script = document.createElement("script");
//       script.src =
//         "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
//       script.async = true;
//       script.onload = () => setIsKatexLoaded(true);
//       document.head.appendChild(script);
//     } else {
//       setIsKatexLoaded(true);
//     }
//   }, []);

//   const renderExpression = React.useCallback(
//     (latex) => {
//       if (!latex || !isKatexLoaded) return null;

//       // Split the expression by \\ or \n to handle both types of line breaks
//       const lines = latex
//         .split(/\\\\|\n/)
//         .map((line) => line.trim())
//         .filter((line) => line.length > 0);

//       return lines.map((line, index) => {
//         const uniqueId = `math-${btoa(line)}-${index}`;

//         React.useEffect(() => {
//           const element = document.getElementById(uniqueId);
//           if (element && window.katex) {
//             try {
//               window.katex.render(line, element, {
//                 throwOnError: false,
//                 displayMode: true,
//                 trust: true,
//                 strict: false,
//               });
//             } catch (error) {
//               console.error(`Failed to render LaTeX line: ${line}`, error);
//             }
//           }
//         }, [line, isKatexLoaded]);

//         return (
//           <div key={uniqueId} className="flex items-center min-h-[2.5rem] px-4">
//             <div id={uniqueId} className="py-1 w-full overflow-x-auto" />
//           </div>
//         );
//       });
//     },
//     [isKatexLoaded]
//   );

//   if (!isKatexLoaded) {
//     return (
//       <div className="space-y-2">
//         {Array(3)
//           .fill(0)
//           .map((_, i) => (
//             <div key={i} className="animate-pulse bg-gray-100 h-8 rounded-md" />
//           ))}
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-lg bg-gray-50 my-2 divide-y divide-gray-200">
//       {renderExpression(expression)}
//     </div>
//   );
// };

// export default MultiLineMathRenderer;
