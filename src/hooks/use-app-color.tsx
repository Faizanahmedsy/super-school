import useGlobalState from '@/store';
import { useEffect } from 'react';

const useAppColor = () => {
  const generalsetting = useGlobalState((state) => state.generalSettings);

  const setColorsFromLocalStorage = () => {
    const primaryColor = generalsetting?.primary_color || '#92400e';
    const primaryLightColor = generalsetting?.secondory_color || '#fff7ed';
    const secondaryColor = generalsetting.secondory_color || '#fff5ed';
    const tertiaryColor = localStorage.getItem('tertiaryColor') || '#ff4405';

    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--primary-light-color', primaryLightColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.documentElement.style.setProperty('--tertiary-color', tertiaryColor);
  };

  useEffect(() => {
    setColorsFromLocalStorage();
  }, []);
};

export default useAppColor;
