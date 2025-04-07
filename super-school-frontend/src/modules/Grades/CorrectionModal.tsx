import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Modal } from 'antd';

interface Props {
  openManualCorrectionModal: boolean;
  setOpenManualCorrectionModal: (value: boolean) => void;
}

export default function CorrectionModal({ openManualCorrectionModal, setOpenManualCorrectionModal }: Props) {
  const data = [
    {
      srNo: 1,
      question: 'Question 1',
      answer: 'Answer 1',
      marks: 3,
    },
    {
      srNo: 2,
      question: 'Question 2',
      answer: 'Answer 2',
      marks: 2,
    },
    {
      srNo: 3,
      question: 'Question 3',
      answer: 'Answer 3',
      marks: 4,
      markedForReview: true,
    },
  ];

  return (
    <>
      <Modal
        open={openManualCorrectionModal}
        onClose={() => setOpenManualCorrectionModal(false)}
        title="Manual Correction"
        width={800}
        onCancel={() => setOpenManualCorrectionModal(false)}
      >
        <div>Modal Content</div>

        {data.map((item, index) => (
          <>
            <Accordion
              type="single"
              collapsible
              defaultValue={item.markedForReview ? `item-${index}` : undefined}
              key={index}
            >
              <AccordionItem
                value={`item-${index}`}
                className={cn('px-5', item.markedForReview && 'bg-rose-100 rounded-sm')}
              >
                <AccordionTrigger>
                  {item.question} {item?.markedForReview && '*'}
                </AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        ))}
      </Modal>
    </>
  );
}
