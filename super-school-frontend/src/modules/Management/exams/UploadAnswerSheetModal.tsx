import BtnLoader from '@/components/custom/buttons/btn-loader';
import PdfViewer from '@/components/global/PdfViewer/PdfViewer';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { displayError } from '@/lib/helpers/errorHelpers';
import { useSingleDelete, useSingleUploadData } from '@/services/bulkpdfupload/bulkUpload.action';
import type { UploadProps } from 'antd';
import { message, Modal, Spin, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { CheckCircle2, FileUp, Trash2, X } from 'lucide-react';
import React from 'react';

const { Dragger } = Upload;

export default function UploadAnswerSheetModal({
  open,
  setOpen,
  studentsId,
  assessmentSubjectId,
  refetch,
  change,
  AnswersheetId,
  setAnswersheetId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  studentsId?: any;
  assessmentSubjectId?: any;
  refetch?: any;
  change?: string;
  AnswersheetId?: any;
  setAnswersheetId?: any;
}) {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewFile, setPreviewFile] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const { mutate: addData, isPending } = useSingleUploadData();

  const { mutate: deleteSignlepdf } = useSingleDelete();

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file: RcFile) => {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        displayError('You can only upload PDF files.');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest({ file, onSuccess }) {
      setTimeout(() => {
        onSuccess && onSuccess('ok', file);
      }, 0);
    },
    onChange(info) {
      const uploadedFile = info.fileList[0]?.originFileObj;
      if (uploadedFile) {
        setFile(uploadedFile);
      } else {
        setFile(null);
      }
    },
    showUploadList: false,
  };

  const uploadFile = async () => {
    if (AnswersheetId) {
      deleteSignlepdf(AnswersheetId, {
        onSuccess: () => {
          setAnswersheetId(null);
        },
      });
    }

    if (!file) return;
    setUploading(true);
    try {
      // const formData = new FormData();
      // formData.append('pdf_path', file);

      const renamedFile = new File([file], `${studentsId}.pdf`, {
        type: file.type,
      });

      const formData = new FormData();
      formData.append('answer_sheet', renamedFile);
      formData.append('assessment_subject', assessmentSubjectId);

      addData(formData, {
        onSuccess: () => {
          setOpen(false);
          setFile(null);
          setUploadProgress(0);
          setAnswersheetId(null);
          refetch();
        },
        onError: (error) => {
          displayError('An error occurred during upload');
        },
      });

      // const response = await fetch('https://e4d7-103-240-34-122.ngrok-free.app/exams/', {
      //   method: 'POST',
      //   headers: {
      //     "ngrok-skip-browser-warning": "69420",
      //     language_code: "en",
      //   },
      //   body: formData,
      // });

      // if (response.ok) {
      //   displaySuccess(`Successfully uploaded the file`);
      //   setOpen(false);
      //   setFile(null);
      //   setUploadProgress(0);
      // } else {
      //   throw new Error("Failed to upload the file");
      // }
    } catch (error) {
      console.error('Upload error:', error);
      displayError('An error occurred during upload');
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

  const deleteFile = () => {
    setFile(null);
    setUploadProgress(0);
    message.info('File removed. You can upload a new file.');
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        width={600}
        footer={null}
        className="p-0"
        closeIcon={<X className="h-4 w-4" />}
      >
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{change ? 'Change' : 'Upload'} Answer Sheet</h2>
            </div>
            {file ? (
              <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handlePreview(file)}>
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">→</span>
                  <span className="text-xs text-blue-500">Preview</span>
                </div>
                <Trash2 className="h-5 w-5 text-red-500 cursor-pointer" onClick={deleteFile} />
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <Dragger {...uploadProps} className="bg-transparent">
                  <div className="p-8 space-y-4">
                    <div className="bg-blue-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <FileUp className="h-6 w-6 text-blue-500" />
                    </div>

                    <div className="space-y-2 text-center">
                      <h3 className="text-lg font-semibold">Drag & drop your PDF file here</h3>
                      <p className="text-sm text-slate-600">
                        or <span className="text-blue-500 hover:text-blue-600 cursor-pointer">browse</span> to choose a
                        file
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        PDF files only
                      </div>
                    </div>
                  </div>
                </Dragger>
              </Card>
            )}
            {previewFile && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload progress</span>
                  <span>{file ? '1 file' : 'No file'}</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="button" onClick={uploadFile} disabled={!file || uploading || isPending}>
                {isPending ? <BtnLoader /> : uploading ? 'Uploading...' : 'Upload file'}
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
