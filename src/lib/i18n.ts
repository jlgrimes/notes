import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import all translations
import en from '../translations/en.json';
import es from '../translations/es.json';
import fr from '../translations/fr.json';
import ja from '../translations/ja.json';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Get stored language from AsyncStorage
      const storedLanguage = await AsyncStorage.getItem(
        '@user_preferred_language'
      );

      if (storedLanguage) {
        return callback(storedLanguage);
      }

      // If no stored language, use device language
      return callback(Localization.locale.split('-')[0]);
    } catch (error) {
      console.error('Error reading language from storage:', error);
      // Fallback to device language
      callback(Localization.locale.split('-')[0]);
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('@user_preferred_language', lng);
    } catch (error) {
      console.error('Error saving language to storage:', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      ja: { translation: ja },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
