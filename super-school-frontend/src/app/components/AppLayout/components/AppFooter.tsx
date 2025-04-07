import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { StyledFooterBtn, StyledFooterBtnView, StyledMainFooter } from './AppFooter.styled';

const AppFooter = () => {
  const { footer } = useLayoutContext();

  if (footer) {
    return (
      <StyledMainFooter>
        <p>Copy right app 2021</p>
        <StyledFooterBtnView>
          <StyledFooterBtn type="link" color="primary">
            Buy Now
          </StyledFooterBtn>
        </StyledFooterBtnView>
      </StyledMainFooter>
    );
  }
  return null;
};

export default AppFooter;
