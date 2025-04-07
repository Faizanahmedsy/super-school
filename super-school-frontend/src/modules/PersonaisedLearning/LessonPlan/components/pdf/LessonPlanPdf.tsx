import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

type LessonPlanPdfProps = {
  htmlContent: string;
  setOpen: any;
};

const LessonPlanPdf: React.FC<LessonPlanPdfProps> = ({ htmlContent, setOpen }) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (pdfRef.current) {
      setIsReady(true);
    }
  }, [pdfRef]);

  const handlePrint = useReactToPrint({
    contentRef: pdfRef, // Changed from 'content' to 'contentRef'
    documentTitle: 'Lesson Plan',
    onAfterPrint: () => {
      setOpen(false);
      // if (pdfRef.current) {
      //   pdfRef.current.innerHTML = '';
      // }
    },
  });

  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isReady && handlePrint) {
      handlePrint();
      setOpen(false);
    }
  };

  return (
    <div className="">
      <div className="flex justify-end mb-3">
        <Button className="mt-4 gap-3" onClick={onButtonClick} disabled={!isReady}>
          <Download /> Download PDF
        </Button>
      </div>
      <div
        ref={pdfRef}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="border p-4 shadow-md rounded-lg bg-white"
      />
    </div>
  );
};

export default LessonPlanPdf;
