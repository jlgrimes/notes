import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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

  const handleSubmit = () => {
    onSubmit(content);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
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
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical='top'
            autoFocus
          />
        </View>

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={handleSubmit}>
            <Icon name='checkmark' size={32} color='#FFFFFF' />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: 24,
    color: '#374151',
    textAlignVertical: 'top',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  fabContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  fab: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
