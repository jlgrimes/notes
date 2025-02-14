import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeProvider';

interface NoteFormProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  initialContent?: string;
  translations: {
    content: string;
    save: string;
    cancel: string;
  };
}

export function NoteForm({
  onSubmit,
  onCancel,
  initialContent,
  translations,
}: NoteFormProps) {
  const [content, setContent] = useState(initialContent || '');
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral[50],
    },
    form: {
      flex: 1,
      padding: theme.spacing.base,
    },
    contentInput: {
      flex: 1,
      fontSize: theme.typography.sizes['xl'],
      lineHeight: theme.typography.sizes['3xl'],
      color: theme.colors.neutral[700],
      textAlignVertical: 'top',
    },
    fabContainer: {
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.base,
      paddingTop: theme.spacing.sm,
    },
    fab: {
      width: '100%',
      height: 56,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.lg,
    },
  });

  const handleSubmit = () => {
    onSubmit(content);
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.contentInput}
          placeholder={translations.content}
          placeholderTextColor={theme.colors.neutral[400]}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical='top'
          autoFocus
        />
      </View>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleSubmit}>
          <Icon name='checkmark' size={32} color={theme.colors.neutral[50]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
