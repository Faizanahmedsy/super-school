import React from 'react';
import { Modal } from 'antd';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import UIDataBlock from '@/components/global/UIDataBlock/UIDataBlock';
import { SupportLogDetailsResp } from '../../types/support-log.types';
import { capitalizeFirstLetter } from '@/lib/common-functions';
import dayjs from 'dayjs';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SupportLogDetailsResp | undefined;
  title?: string;
}

const ImageModal = ({ isOpen, onClose, data, title = 'Image Gallery' }: ImageModalProps) => {
  const images = data?.attachment || [];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      title={title}
      className="image-modal"
      closeIcon={<X className="h-4 w-4" />}
    >
      <div className="grid grid-cols-4 gap-4 p-6">
        <div className="col-span-2">
          <UIDataBlock title="User Name" data={data?.creator?.user_name} />
        </div>
        <div className="col-span-2">
          <UIDataBlock title="Email" data={data?.creator?.email} />
        </div>
        <div className="col-span-2">
          <UIDataBlock title="School" data={data?.institute?.school_name} />
        </div>
        <UIDataBlock title="Role" data={capitalizeFirstLetter(data?.role_name)} />
        <UIDataBlock title="Created At" data={String(dayjs(data?.created_at).format('DD-MM-YYYY'))} />
        <div className="col-span-4">
          <UIDataBlock title="Description" data={data?.description} />
        </div>
      </div>
      <div className="relative overflow-hidden px-5 rounded-lg">
        <div className="flex items-center justify-center bg-slate-100 p-6 min-h-[400px] rounded-lg">
          {images.length != 0 ? (
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-h-[60vh] w-auto object-contain"
            />
          ) : (
            'No Image Available'
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-950 shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-slate-950"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous image</span>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-950 shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-slate-950"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next image</span>
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-blue-600 w-4' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <span className="sr-only">Image {index + 1}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ImageModal;
