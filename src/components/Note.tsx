import React from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from '../theme/components/Text';

interface NoteProps {
  id: string;
  content: string;
  onEdit: (id: string) => void;
}

export function Note({ id, content, onEdit }: NoteProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.neutral[50],
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      ...Platform.select({
        web: {
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderWidth: 1,
          borderColor: theme.colors.neutral[100],
        },
        default: {
          ...theme.shadows.md,
        },
      }),
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={() => onEdit(id)}>
      <Text variant='body' color={theme.colors.neutral[700]}>
        {content}
      </Text>
    </TouchableOpacity>
  );
}
