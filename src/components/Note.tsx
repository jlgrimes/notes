import React from 'react';
import { StyleSheet, TouchableOpacity, Platform, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from '../theme/components/Text';

interface NoteProps {
  id: string;
  content: string;
  onEdit: (id: string) => void;
  createdAt?: string;
}

export function Note({ id, content, onEdit, createdAt }: NoteProps) {
  const theme = useTheme();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.neutral[50],
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      borderWidth: 1,
      borderColor: theme.colors.neutral[200],
    },
    content: {
      marginBottom: theme.spacing.sm,
    },
    date: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.neutral[400],
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={() => onEdit(id)}>
      <Text
        variant='body'
        color={theme.colors.neutral[700]}
        style={styles.content}
      >
        {content}
      </Text>
      <Text style={styles.date}>{formatDate(createdAt)}</Text>
    </TouchableOpacity>
  );
}
