import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import si from './si.json';
import ta from './ta.json';

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        si: { translation: si },
        ta: { translation: ta },
    },
    lng: localStorage.getItem('ceyseat_lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
});

export default i18n;