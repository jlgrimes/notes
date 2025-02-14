import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from '../theme/components/Text';

interface NoteProps {
  id: string;
  content: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Note({ id, content, onEdit, onDelete }: NoteProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const date = new Date(content.split(' ')[0]);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    editButton: {
      backgroundColor: theme.colors.neutral[100],
    },
    deleteButton: {
      backgroundColor: theme.colors.error.light + '20', // 20 is for opacity
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(id)}
          style={[styles.button, styles.editButton]}
        >
          <Feather name='edit-2' size={16} color={theme.colors.neutral[500]} />
          <Text
            variant='body-sm'
            weight='medium'
            color={theme.colors.neutral[500]}
          >
            {t('common.edit')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(id)}
          style={[styles.button, styles.deleteButton]}
        >
          <Feather name='trash-2' size={16} color={theme.colors.neutral[500]} />
          <Text
            variant='body-sm'
            weight='medium'
            color={theme.colors.neutral[500]}
          >
            {t('common.delete')}
          </Text>
        </TouchableOpacity>
      </View>
      <Text variant='body' color={theme.colors.neutral[700]}>
        {content}
      </Text>
    </View>
  );
}
