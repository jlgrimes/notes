import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SuggestionPill } from './SuggestionPill';
import { AILoadingIndicator } from './AILoadingIndicator';

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
    return (
      <View style={styles.spinnerContainer}>
        <AILoadingIndicator size={30} color='#4F46E5' />
        <Text style={styles.loadingText}>Getting suggestions...</Text>
      </View>
    );
  }

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
  spinnerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
});
