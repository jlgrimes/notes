import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Gradient } from '../theme/components/Gradient';

interface SuggestionPillProps {
  suggestion: string;
  onPress: () => void;
  smart?: boolean;
}

export function SuggestionPill({
  suggestion,
  onPress,
  smart = false,
}: SuggestionPillProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    pill: {
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      width: '100%',
    },
    gradientPill: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      width: '100%',
    },
    regularPill: {
      backgroundColor: theme.colors.neutral[50],
      borderWidth: 1,
      borderColor: theme.colors.neutral[200],
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    smartText: {
      fontSize: theme.typography.sizes.base,
      color: theme.colors.neutral[50],
      fontWeight: theme.typography.weights.medium,
    },
    regularText: {
      fontSize: theme.typography.sizes.base,
      color: theme.colors.primary[500],
      fontWeight: theme.typography.weights.medium,
    },
  });

  if (smart) {
    return (
      <TouchableOpacity style={styles.pill} onPress={onPress}>
        <Gradient type='primary' style={styles.gradientPill}>
          <Text style={styles.smartText}>{suggestion}</Text>
        </Gradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.pill, styles.regularPill]}
      onPress={onPress}
    >
      <Text style={styles.regularText}>{suggestion}</Text>
    </TouchableOpacity>
  );
}
