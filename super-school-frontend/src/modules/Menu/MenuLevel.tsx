import AppAnimate from '@/app/components/AppAnimate';
import InjectMassage from '@/app/helpers/IntlMessages';

const MenuLevel = () => {
  return (
    <AppAnimate animation="transition.slideUpIn" delay={200}>
      <div
        style={{
          fontSize: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <InjectMassage id="sidebar.multiLevel" />
      </div>
    </AppAnimate>
  );
};

export default MenuLevel;
