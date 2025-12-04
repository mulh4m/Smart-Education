import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./translation/en.json";
import arTranslation from "./translation/ar.json";
import { loadBootstrapCSS } from "../utils/bootstrapLoader";

const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },

  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

// Direction left to right, and right to left
i18n.on('initialized', () => {
  const currentLang = i18n.language;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = currentLang;
  
  // Ensure Bootstrap CSS is loaded with correct RTL/LTR version
  loadBootstrapCSS(currentLang === "ar");
});

export default i18n;
