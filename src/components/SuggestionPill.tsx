import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Gradient } from '../theme/components/Gradient';
import { Text } from '../theme/components/Text';

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
  });

  if (smart) {
    return (
      <TouchableOpacity style={styles.pill} onPress={onPress}>
        <Gradient type='primary' style={styles.gradientPill}>
          <Text variant='body' weight='medium' color={theme.colors.neutral[50]}>
            {suggestion}
          </Text>
        </Gradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.pill, styles.regularPill]}
      onPress={onPress}
    >
      <Text variant='body' weight='medium' color={theme.colors.primary[500]}>
        {suggestion}
      </Text>
    </TouchableOpacity>
  );
}
