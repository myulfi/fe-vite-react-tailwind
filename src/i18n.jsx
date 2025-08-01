import i18n from "i18next"
import i18nBackend from "i18next-http-backend"
import { initReactI18next } from "react-i18next"

i18n
    .use(i18nBackend)
    .use(initReactI18next)
    .init({
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: import.meta.env.VITE_API_URL + "\\{{lng}}\\language.json",
        },
    });

export default i18n