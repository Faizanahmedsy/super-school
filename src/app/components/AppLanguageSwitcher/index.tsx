import React, { useEffect, useState } from 'react';
import languageData from './data';

import { LayoutDirection } from '@/app/constants/AppEnums';
import { useLayoutActionsContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { useLocaleActionsContext, useLocaleContext } from '@/app/context/AppContextProvider/LocaleContextProvider';
import { LanguageProps } from '@/app/types/models/Apps';
import { setItem } from '@/lib/localstorage';
import { Dropdown } from 'antd';
import { StyledLangItem, StyledLangText } from './index.styled';
import useGlobalState from '@/store';

type AppLanguageSwitcherProps = {
  iconOnly?: boolean;
};

const AppLanguageSwitcher: React.FC<AppLanguageSwitcherProps> = () => {
  const { rtlLocale, locale } = useLocaleContext();
  const { updateLocale } = useLocaleActionsContext();
  const { updateDirection } = useLayoutActionsContext();
  const lang = useGlobalState.getState().lang_name;
  const setLang = useGlobalState((state) => state.setLang);
  const defaultLanguage = languageData.find((lang) => lang.locale === 'af');
  const [currentLocale, setCurrentLocale] = useState<LanguageProps>(locale || lang!);

  // Synchronize `currentLocale` with `locale` whenever `locale` changes
  // useEffect(() => {
  //   if (locale) {
  //     setCurrentLocale(locale);
  //   } else {
  //     // Fallback to default if `locale` is not defined
  //     setCurrentLocale(defaultLanguage!);
  //   }
  // }, [defaultLanguage, locale]);

  // Sync currentLocale with global state `lang`
  useEffect(() => {
    const selectedLang = languageData.find((language) => language.locale === lang);
    if (selectedLang) {
      setCurrentLocale(selectedLang);
    } else if (locale) {
      setCurrentLocale(locale);
    } else {
      setCurrentLocale(defaultLanguage!);
    }
  }, [lang, locale, defaultLanguage]);

  const changeLanguage = (language: LanguageProps) => {
    const languageMap: Record<string, string> = {
      English: 'en',
      Afrikaans: 'af',
      IsiZulu: 'is',
    };

    const locale = languageMap[language?.name] || 'en';
    console.log('localelocale', locale);

    setItem('locale', { ...language, locale });
    if (locale) {
      setLang(locale);
    }

    console.log('language', language);

    const direction = rtlLocale.includes(language.locale) ? LayoutDirection.RTL : LayoutDirection.LTR;
    updateDirection(direction);
    updateLocale(language);
    setCurrentLocale(language);
  };

  const items = languageData.map((language, index) => {
    const isActive = currentLocale.locale === language.locale;
    return {
      key: index,
      label: (
        <StyledLangItem key={index} isActive={isActive} onClick={() => changeLanguage(language)}>
          <>{language?.icon}</>
          <h4>{language?.name}</h4>
        </StyledLangItem>
      ),
    };
  });

  return (
    <Dropdown menu={{ items }} trigger={['click']} overlayStyle={{ zIndex: 1052 }}>
      <div
        className="flex justify-center items-center border rounded-2xl p-1 text-sm cursor-pointer w-[100px] 
           sm:w-[100px] md:w-[50px] lg:w-[50px] xl:w-[50px] 2xl:w-[50px]"
        onClick={(e) => e.preventDefault()}
      >
        <div className="flex justify-center items-center mx-3 ">
          <p className="text-sm p-0 m-0">{currentLocale?.languageId?.substring(0, 3).toUpperCase()}</p>
          <StyledLangText className="lang-text">{currentLocale?.name}</StyledLangText>
        </div>
      </div>
    </Dropdown>
  );
};

export default AppLanguageSwitcher;
