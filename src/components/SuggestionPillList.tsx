import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SuggestionPill } from './SuggestionPill';

interface SuggestionPillListProps {
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
  isLoading?: boolean;
  smart?: boolean;
}

export function SuggestionPillList({
  suggestions,
  onSuggestionPress,
  smart = false,
}: SuggestionPillListProps) {
  return (
    <View style={styles.suggestionsList}>
      {suggestions.map((suggestion, index) => (
        <SuggestionPill
          key={index}
          suggestion={suggestion}
          onPress={() => onSuggestionPress(suggestion)}
          smart={smart}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionsList: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
});
