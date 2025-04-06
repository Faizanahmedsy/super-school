// import { useEffect, useRef, useState } from 'react';
// import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'; // Import PDF.js worker

// // Set the worker source
// GlobalWorkerOptions.workerSrc = pdfWorker;

// const PDFViewer = ({ url }: { url: string }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [pageNum, setPageNum] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     const loadPDF = async () => {
//       try {
//         const pdf = await getDocument({ url }).promise;
//         setTotalPages(pdf.numPages);
//         renderPage(pdf, pageNum);
//       } catch (error) {
//         console.error('Error loading PDF:', error);
//       }
//     };

//     const renderPage = async (pdf: any, pageNumber: number) => {
//       const page = await pdf.getPage(pageNumber);
//       const scale = 1.5;
//       const viewport = page.getViewport({ scale });
//       const canvas = canvasRef.current;
//       if (!canvas) return;

//       const context = canvas.getContext('2d');
//       canvas.width = viewport.width;
//       canvas.height = viewport.height;

//       const renderContext = {
//         canvasContext: context!,
//         viewport,
//       };
//       await page.render(renderContext).promise;
//     };

//     loadPDF();
//   }, [url, pageNum]); // Fix: Added pageNum to dependencies

//   return (
//     <div>
//       <div className="flex justify-center mt-2 space-x-2">
//         <button onClick={() => setPageNum((prev) => Math.max(1, prev - 1))} disabled={pageNum === 1}>
//           Previous
//         </button>
//         <span>
//           {pageNum} / {totalPages}
//         </span>
//         <button onClick={() => setPageNum((prev) => Math.min(totalPages, prev + 1))} disabled={pageNum === totalPages}>
//           Next
//         </button>
//       </div>
//       <canvas ref={canvasRef} className="pdfViewer"></canvas>
//     </div>
//   );
// };

// export default PDFViewer;

import UILoader from '@/components/custom/loaders/UILoader';
import React, { useEffect, useState } from 'react';

const PdfViewer = ({ url }: { url: string }) => {
  const [Url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      // Fetch Question Sheet PDF
      fetch(`${url}`, {
        method: 'GET',
        headers: {
          language_code: 'en',
          'Content-Type': 'application/pdf',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load Question Sheet PDF');
          }
          return response.blob();
        })
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          setUrl(objectURL);
        })
        .catch((error) => {
          console.error('Error fetching Question Sheet PDF:', error);
        });
    }
  }, [url]);

  return (
    <>
      <div className="flex justify-center h-[80vh] w-full">
        {Url ? (
          <object data={Url} type="application/pdf" width="100%" height="100%">
            <p>
              Unable to display PDF file.{' '}
              <a href={Url} target="_blank" rel="noopener noreferrer">
                Download
              </a>{' '}
              instead.
            </p>
          </object>
        ) : (
          <p className="flex justify-center align-items-center">
            <UILoader />
          </p>
        )}
      </div>
    </>
  );
};

export default PdfViewer;
