import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SuggestionPill } from './SuggestionPill';
import { MotiView } from 'moti';

interface SuggestionPillListProps {
  suggestions?: string[];
  onSuggestionPress: (suggestion: string) => void;
  smart?: boolean;
}

export function SuggestionPillList({
  suggestions,
  onSuggestionPress,
  smart = false,
}: SuggestionPillListProps) {
  if (!suggestions) {
    return null;
  }

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: 300 }}
      style={styles.suggestionsList}
    >
      {suggestions.map((suggestion, index) => (
        <SuggestionPill
          key={index}
          suggestion={suggestion}
          onPress={() => onSuggestionPress(suggestion)}
          smart={smart}
        />
      ))}
    </MotiView>
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
