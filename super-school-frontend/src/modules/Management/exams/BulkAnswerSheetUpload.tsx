import BtnLoader from '@/components/custom/buttons/btn-loader';
import PdfViewer from '@/components/global/PdfViewer/PdfViewer';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { displayWarning } from '@/lib/helpers/warningHelpers';
import { useBulkUploadData } from '@/services/bulkpdfupload/bulkUpload.action';
import { DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Modal, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { CheckCircle2, EyeIcon, FileUp, X } from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';

const { Dragger } = Upload;

interface BulkAnswerSheetUploadProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  refetch?: any;
}

export default function BulkAnswerSheetUpload({ open, setOpen, refetch }: BulkAnswerSheetUploadProps) {
  const [fileCount, setFileCount] = React.useState(0);
  const [fileList, setFileList] = React.useState<any[]>([]);
  const [previewFile, setPreviewFile] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const params: any = useParams();

  const { mutateAsync: addData, isPending } = useBulkUploadData();

  const uploadProps: UploadProps = {
    name: 'answer_sheet',
    multiple: false,
    fileList: fileList.map((file) => ({
      uid: file.name,
      name: file.name,
      status: 'done',
      originFileObj: file,
    })),
    beforeUpload: (file: RcFile) => {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        displayError('You can only upload PDF files.');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange(info) {
      // Retain only the latest file
      const latestFile = info.fileList.slice(-1).map((file) => file.originFileObj as File);
      setFileList(latestFile);
      setFileCount(latestFile.length);
    },
    onRemove(file) {
      setFileList([]);
      setFileCount(0);
    },
  };

  // const uploadProps: UploadProps = {
  //   name: 'answer_sheet',
  //   multiple: true,
  //   beforeUpload: (file: RcFile) => {
  //     const isPDF = file.type === 'application/pdf';
  //     if (!isPDF) {
  //       displayError('You can only upload PDF files.');
  //       return Upload.LIST_IGNORE;
  //     }
  //     return true;
  //   },
  //   customRequest({ file, onSuccess }) {
  //     setTimeout(() => {
  //       onSuccess && onSuccess('ok', file);
  //     }, 0);
  //   },
  //   onChange(info) {
  //     setFileList(info.fileList.map((file: any) => file.originFileObj));
  //     setFileCount(info.fileList.length);
  //   },
  //   onDrop(e) {
  //     setFileList(Array.from(e.dataTransfer.files));
  //     setFileCount(e.dataTransfer.files.length);
  //   },
  // };

  const uploadFiles = async () => {
    if (fileList.length === 0) return;
    setUploading(true);

    if (!uploading) {
      displayWarning('Please wait while your files are uploading... Do not refresh the page.');
    }
    try {
      const formData = new FormData();
      formData.append('assessment_subject', params?.id);
      formData.append('answer_sheet', fileList[0]);
      await addData(formData, {
        onSuccess() {
          refetch();
        },
      });
      setOpen(false);
      setFileList([]);
      setFileCount(0);
      setPreviewFile(null);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async (file: File) => {
    const fileURL = URL.createObjectURL(file);
    setPreviewFile(fileURL);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const handleDeleteFile = (index: number) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
    setFileCount((prev) => prev - 1);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          setFileList([]);
        }}
        width={600}
        footer={null}
        className="p-0"
        closeIcon={<X className="h-4 w-4" />}
      >
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                <UIText>Upload Answer Sheet</UIText>
              </h2>
            </div>

            <Card className="border-2 border-dashed">
              <Dragger showUploadList={false} {...uploadProps} className="bg-transparent">
                <div className="p-8 space-y-4">
                  <div className="bg-blue-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <FileUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-semibold">
                      {' '}
                      <UIText>Drag & drop your PDF files here</UIText>
                    </h3>
                    <p className="text-sm text-slate-600">
                      or <span className="text-blue-500 hover:text-blue-600 cursor-pointer">browse</span> to choose
                      files
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <UIText>PDF files only</UIText>
                    </div>
                  </div>
                </div>
              </Dragger>
            </Card>
            <div className="space-y-4 max-h-[20vh] overflow-y-auto scroll-area">
              {fileList.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <span className="text-xs flex justify-start gap-3">
                    <EyeIcon size={19} className="text-blue-600 cursor-pointer" onClick={() => handlePreview(file)} />
                    <DeleteOutlined
                      className="text-red-600 text-sm"
                      onClick={() => handleDeleteFile(index)}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    />{' '}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={() => {
                  uploadFiles();
                  setFileList([]);
                }}
                disabled={fileCount === 0 || uploading || isPending}
              >
                {isPending ? (
                  <>
                    <BtnLoader />
                    {`${'Uploading...'}`}
                  </>
                ) : uploading ? (
                  'Uploading...'
                ) : (
                  `Upload ${fileCount > 0 ? `${fileCount} files` : ''}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={isPreviewOpen} onCancel={closePreview} footer={null} width={800} className="p-0">
        <div className="p-0">
          <h2 className="text-lg font-semibold mb-4">
            <UIText>PDF Preview</UIText>
          </h2>
          {previewFile && (
            <div className="h-[auto]">
              <PdfViewer url={previewFile} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
