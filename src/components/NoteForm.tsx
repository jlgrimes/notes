import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from '../theme/components/Text';

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
    content: {
      flex: 1,
    },
    header: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
    },
    form: {
      flex: 1,
      padding: theme.spacing.base,
    },
    contentInput: {
      flex: 1,
      fontSize: theme.typography.sizes['2xl'],
      color: theme.colors.neutral[700],
      textAlignVertical: 'top',
    },
    cancelButton: {
      padding: theme.spacing.sm,
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text
            variant='body'
            weight='medium'
            color={theme.colors.neutral[500]}
          >
            {translations.cancel}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
