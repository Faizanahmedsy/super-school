import { Row } from 'antd';
import React, { ReactNode } from 'react';
import AppAnimate from '../AppAnimate';

type AppRowContainerProps = {
  children: ReactNode;

  [x: string]: any;
};

const AppRowContainer: React.FC<AppRowContainerProps> = ({ children, ...others }) => {
  return (
    // <StyledAppRowContainer>
    <AppAnimate>
      <Row style={{ flexDirection: 'row', marginBottom: 16 }} gutter={{ xs: 16, sm: 16, md: 32 }} {...others}>
        {children}
      </Row>
    </AppAnimate>
    // </StyledAppRowContainer>
  );
};

export default AppRowContainer;
