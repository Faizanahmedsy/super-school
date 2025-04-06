import { Button } from 'antd';
import { useDropzone } from 'react-dropzone';
import {
  StyledInfoUpload,
  StyledInfoUploadAvatar,
  StyledInfoUploadBtnView,
  StyledInfoUploadContent,
} from '@/modules/Profile/UserProfile/PersonalInfo/index.styled';
import { useEffect } from 'react';

const ProfileImageUpload = ({
  userImage,
  setUserImage,
}: {
  userImage: File | null;
  setUserImage: (img: File | null) => void;
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 800 * 1024, // 800kB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUserImage(acceptedFiles[0]);
      }
    },
  });

  const previewImage = userImage instanceof File ? URL.createObjectURL(userImage) : '/assets/images/placeholder.jpg';

  useEffect(() => {
    return () => {
      if (userImage instanceof File) {
        URL.revokeObjectURL(previewImage); // Clean up object URL
      }
    };
  }, [userImage]);

  const onReset = () => {
    setUserImage(null);
  };

  return (
    <StyledInfoUpload>
      <StyledInfoUploadAvatar src={previewImage} alt="Profile Preview" />
      <StyledInfoUploadContent>
        <StyledInfoUploadBtnView>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <label htmlFor="icon-button-file">
              <Button type="primary">Upload</Button>
            </label>
          </div>
          <Button onClick={onReset}>Reset</Button>
        </StyledInfoUploadBtnView>
        <p>Allowed JPG,PNG. Max size of 800kB</p>
      </StyledInfoUploadContent>
    </StyledInfoUpload>
  );
};
export default ProfileImageUpload;
