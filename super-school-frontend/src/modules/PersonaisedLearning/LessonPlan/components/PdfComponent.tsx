// // PdfComponent.tsx
// import React from 'react';
// import { Page, Text as PDFText, View, Document as PDFDocument, StyleSheet as PDFStyleSheet } from '@react-pdf/renderer';

// // Define styles for the PDF
// const styles = PDFStyleSheet.create({
//   page: {
//     flexDirection: 'row',
//     backgroundColor: '#E4E4E4',
//   },
//   section: {
//     margin: 10,
//     padding: 10,
//     flexGrow: 1,
//   },
//   table: {
//     display: 'table',
//     width: '100%',
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderColor: '#000',
//   },
//   tableRow: {
//     flexDirection: 'row',
//   },
//   tableCell: {
//     margin: 'auto',
//     marginTop: 5,
//     fontSize: 10,
//     padding: 10,
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderColor: '#000',
//   },
// });

// // Component to render the PDF
// export const PdfComponent = () => (
//   <PDFDocument>
//     <Page size="A4" style={styles.page}>
//       <View style={styles.section}>
//         <View style={styles.table}>
//           <View style={styles.tableRow}>
//             <PDFText style={[styles.tableCell, { backgroundColor: '#00ffff' }]}>Monday</PDFText>
//             <PDFText style={[styles.tableCell, { backgroundColor: '#ffe599' }]}>Tuesday</PDFText>
//             <PDFText style={[styles.tableCell, { backgroundColor: '#c9daf8' }]}>Wednesday</PDFText>
//             <PDFText style={[styles.tableCell, { backgroundColor: '#f4cccc' }]}>Thursday</PDFText>
//             <PDFText style={[styles.tableCell, { backgroundColor: '#f9cb9c' }]}>Friday</PDFText>
//             <PDFText style={[styles.tableCell, { backgroundColor: '#9fc5e8' }]}>Saturday</PDFText>
//           </View>
//           <View style={styles.tableRow}>
//             <PDFText style={[styles.tableCell, { backgroundColor: '#f0f8ff' }]}>
//               <PDFText style={{ color: '#00aaff' }}>Topic:</PDFText> Introduction to Algebra
//               {'\n'}
//               <PDFText style={{ color: '#00aaff' }}>Activity:</PDFText>
//               {'\n'}- Explain basic algebraic concepts (variables, expressions, equations).
//               {'\n'}- Solve simple equations together as a class.
//               {'\n'}- Group activity: Create algebraic expressions from word problems.
//             </PDFText>
//             {/* Repeat for other days */}
//           </View>
//         </View>
//       </View>
//     </Page>
//   </PDFDocument>
// );
