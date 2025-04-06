import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import translationEnglish from './components/translatedLanguages/english.json';
import translationFrench from './components/translatedLanguages/french.json';

const storedLang = localStorage.getItem('selectedLanguage');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    lng: storedLang,
    fallbackLng: 'fr', // use en if detected lng is not available
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    resources: {
      en: {
        translations: translationEnglish,
      },
      fr: {
        translations: translationFrench,
      },
    },
    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',
    storedLang,
  });

i18n.changeLanguage(storedLang);

export default i18n;
