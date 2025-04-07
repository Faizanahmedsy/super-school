import loadingAnimation from '@/assets/lottie/lottie-loading-1.json';
import Lottie from 'lottie-react';
import styled from 'styled-components';

const StyledAppLoader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const AppLoader = () => {
  return (
    <StyledAppLoader>
      <div className="w-44 h-44">
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
    </StyledAppLoader>
  );
};

export default AppLoader;
