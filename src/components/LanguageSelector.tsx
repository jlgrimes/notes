import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
};

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Language</Text>
      <View style={styles.languageList}>
        {Object.entries(LANGUAGES).map(([lang, name]) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.languageButton,
              currentLanguage === lang && styles.selectedLanguage,
            ]}
            onPress={() => handleLanguageChange(lang)}
          >
            <Text
              style={[
                styles.languageText,
                currentLanguage === lang && styles.selectedLanguageText,
              ]}
            >
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  languageList: {
    gap: 8,
  },
  languageButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedLanguage: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  languageText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  selectedLanguageText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
