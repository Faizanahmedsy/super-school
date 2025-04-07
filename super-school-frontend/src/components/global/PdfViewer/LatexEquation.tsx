// import { StyleSheet, Text, View } from "@react-pdf/renderer";
// import katex from "katex";
// import React from "react";

// const styles = StyleSheet.create({
//   equationContainer: {
//     margin: 5,
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   equation: {
//     fontFamily: "KaTeX_Main",
//     fontSize: 12,
//   },
//   alignedRight: {
//     textAlign: "right",
//   },
// });

// interface LatexEquationProps {
//   latex: string;
//   align?: "left" | "right" | "center";
// }

// const LatexEquation: React.FC<LatexEquationProps> = ({
//   latex,
//   align = "left",
// }) => {
//   const processEquation = (eq: string) => {
//     // Split equations by line breaks
//     return eq.split("\\\\").map((line, index) => {
//       const trimmedLine = line.trim();
//       try {
//         const rendered = katex.renderToString(trimmedLine, {
//           throwOnError: false,
//           output: "mathml",
//         });

//         return (
//           <Text
//             key={index}
//             style={[styles.equation, align === "right" && styles.alignedRight]}
//           >
//             {rendered}
//           </Text>
//         );
//       } catch (error) {
//         console.error(`Error rendering equation: ${trimmedLine}`, error);
//         return (
//           <Text key={index} style={styles.equation}>
//             {trimmedLine}
//           </Text>
//         );
//       }
//     });
//   };

//   return <View style={styles.equationContainer}>{processEquation(latex)}</View>;
// };

// export default LatexEquation;
