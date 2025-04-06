import { Button } from '@/components/ui/button';
import { Modal } from 'antd';
import React from 'react';
import LessonPlanPdf from '../pdf/LessonPlanPdf';

export default function ViewLessonPlanPdfModal({ info }: { info: any }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant={'outline'} onClick={() => setOpen(true)} className="rounded-md">
        View
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Lesson Plan"
        footer={null}
        width={1200}
        onCancel={() => setOpen(false)}
      >
        <LessonPlanPdf htmlContent={info.activity} setOpen={setOpen} />
      </Modal>
    </>
  );
}
