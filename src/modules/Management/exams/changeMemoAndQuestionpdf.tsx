import PdfViewer from '@/components/global/PdfViewer/PdfViewer';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { displayError } from '@/lib/helpers/errorHelpers';
import { useChangeMemoData, useChangeQuestionData } from '@/services/bulkpdfupload/bulkUpload.action';
import type { UploadProps } from 'antd';
import { Form, message, Modal, Spin, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { CheckCircle2, FileUp, Trash2, X } from 'lucide-react';
import { useState } from 'react';
const { Dragger } = Upload;

export default function UploadMemoAndQuestionModal({
  open,
  setOpen,
  assessmentSubjectId,
  refetch,
  pdfName,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  assessmentSubjectId?: any;
  refetch?: any;
  pdfName?: any;
}) {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { mutate: changememo, isPending: memoPending } = useChangeMemoData();
  const { mutate: changeQuestion, isPending: questionPending } = useChangeQuestionData();

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
        setFile(new File([uploadedFile], uploadedFile.name, { type: uploadedFile.type }));
      } else {
        setFile(null);
      }
    },
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
    message.info('File removed. You can upload a new file.');
  };

  const onFinish = () => {
    if (!file) return;
    setUploading(true);
    const renamedFile = new File([file], `${pdfName}.pdf`, {
      type: file.type,
    });

    const formData = new FormData();
    formData.append(`assessment_subject_id`, assessmentSubjectId);
    if (pdfName == 'Memo') {
      formData.append(`memo`, renamedFile);
    }
    if (pdfName == 'Question Paper') {
      formData.append(`question_paper`, renamedFile);
    }

    {
      pdfName == 'Question Paper'
        ? changeQuestion(formData, {
            onSuccess: () => {
              setOpen(false);
              setFile(null);
              refetch();
              form.resetFields();
            },
            onSettled: () => {
              setUploading(false);
            },
          })
        : changememo(formData, {
            onSuccess: () => {
              setOpen(false);
              setFile(null);
              refetch();
              form.resetFields();
            },
            onSettled: () => {
              setUploading(false);
            },
          });
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          setFile(null);
          form.resetFields();
        }}
        width={600}
        footer={null}
        className="p-0"
        closeIcon={<X className="h-4 w-4" />}
      >
        <Form form={form} onFinish={onFinish}>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Change {pdfName}</h2>
              </div>
              {file ? (
                <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => handlePreview(file)}>
                    <span className="text-sm">{file.name}</span>
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
                          or <span className="text-blue-500 hover:text-blue-600 cursor-pointer">browse</span> to choose
                          a file
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

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setFile(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!file || uploading || memoPending || questionPending}>
                  {memoPending || questionPending ? 'Uploading...' : uploading ? 'Uploading...' : 'Upload file'}
                </Button>
              </div>
            </div>
          </div>
        </Form>
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
