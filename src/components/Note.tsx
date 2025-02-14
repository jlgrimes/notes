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
      padding: theme.spacing.base,
      borderWidth: 1,
      borderColor: theme.colors.neutral[200],
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
