import React, { useEffect } from 'react';
import { Upload, Image as AntdImage } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import CustomFormItem from '../custom/form/CustomFormItem';

interface UserLogoUploadProps {
  fileList: UploadFile[];
  initialLogoUrl?: string;
  onFileChange: (fileUrl: string | null, file: UploadFile | null) => void;
}

const UserLogoUpload: React.FC<UserLogoUploadProps> = ({ fileList, initialLogoUrl, onFileChange }) => {
  const [previewImage, setPreviewImage] = React.useState<string | null>(initialLogoUrl || null);
  const [previewOpen, setPreviewOpen] = React.useState<boolean>(false);

  useEffect(() => {
    if (initialLogoUrl) {
      setPreviewImage(initialLogoUrl);
    } else {
      setPreviewImage(null);
    }
  }, [initialLogoUrl]);

  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    if (fileList.length > 0) {
      const file = fileList[0];
      const fileUrl = file.thumbUrl || file.url || null;
      setPreviewImage(fileUrl);

      // Call the parent callback with the selected file URL and file object
      onFileChange(fileUrl, file);
    } else {
      setPreviewImage(null);
      onFileChange(null, null);
    }
  };

  const uploadButton = (
    <div>
      <span>+ Upload</span>
    </div>
  );

  return (
    <>
      <CustomFormItem label="Select User Logo" name="userlogo">
        <Upload
          listType="picture-card"
          accept="image/*"
          fileList={fileList}
          maxCount={1}
          onPreview={(file) => {
            setPreviewImage(file.url || file.thumbUrl || previewImage);
            setPreviewOpen(true);
          }}
          onChange={handleFileChange}
          beforeUpload={() => false}
        >
          {fileList.length < 1 && uploadButton}
        </Upload>

        {previewImage && (
          <AntdImage
            wrapperStyle={{ display: 'none' }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(initialLogoUrl || null),
            }}
            src={previewImage}
          />
        )}
      </CustomFormItem>
    </>
  );
};

export default UserLogoUpload;
