import AppAnimate from '@/app/components/AppAnimate';
import AppPageMeta from '@/app/components/AppPageMeta';
import IntlMessages from '@/app/helpers/IntlMessages';
import Logo from '../../../assets/icon/comingsoon.svg';
import { StyledErrorContainer, StyledErrorContent, StyledErrorImageLg, StyledErrorPara } from '../index.styled';

const ComingSoon = () => {
  return (
    <>
      <AppPageMeta title="Coming Soon" />
      <AppAnimate animation="transition.slideUpIn" delay={200}>
        <StyledErrorContainer key="coming_soon">
          <StyledErrorImageLg>
            <img src={Logo} alt={Logo} />
          </StyledErrorImageLg>
          <div>
            <StyledErrorContent>
              <h3>
                <IntlMessages id="error.comingSoon" />!
              </h3>
              <StyledErrorPara>
                <p className="mb-0">
                  <IntlMessages id="error.comingSoonMessage1" />
                </p>
                <p className="mb-0">
                  <IntlMessages id="error.comingSoonMessage2" />
                </p>
              </StyledErrorPara>
            </StyledErrorContent>
          </div>
          {/*<AppInfoView />*/}
        </StyledErrorContainer>
      </AppAnimate>
    </>
  );
};

export default ComingSoon;
