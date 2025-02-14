import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SuggestionPill } from './SuggestionPill';
import { MotiView } from 'moti';
import { slideUpAndFadeInWithDelay } from '../lib/animations';
import { useTheme } from '../theme/ThemeProvider';

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
  const theme = useTheme();

  const styles = StyleSheet.create({
    suggestionsList: {
      flexDirection: 'column',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.base,
      marginBottom: theme.spacing['2xl'],
    },
  });

  if (!suggestions) {
    return null;
  }

  return (
    <View style={styles.suggestionsList}>
      {suggestions.map((suggestion, index) => (
        <MotiView key={index} {...slideUpAndFadeInWithDelay(index * 100)}>
          <SuggestionPill
            suggestion={suggestion}
            onPress={() => onSuggestionPress(suggestion)}
            smart={smart}
          />
        </MotiView>
      ))}
    </View>
  );
}
