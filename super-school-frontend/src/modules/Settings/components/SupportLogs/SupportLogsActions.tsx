import { Button } from '@/components/ui/button';
import { useReportDetails } from '@/modules/HelpAndSupport/action/help-and-support.action';
import { Modal } from 'antd';
import { useState } from 'react';
import ImageModal from './ImageModal';

export const SupportLogsActions = ({ row }: { row: any }) => {
  const [id, setId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [attachments, setAttachments] = useState<any>(null);

  const details = useReportDetails(Number(id));
  const images = details?.data?.attachment || [];
  return (
    <>
      <div className="flex items-center">
        <Button
          size={'sm'}
          className="bg-primary text-white py-1 px-2 rounded-md"
          onClick={() => {
            setId(row.original.id);
            setOpenModal(true);
            details?.refetch();
          }}
        >
          View Attachments
        </Button>
      </div>

      <ImageModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        data={details?.data}
        title="Support Log Details"
      />
    </>
  );
};
