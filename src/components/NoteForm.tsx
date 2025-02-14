import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
        </TouchableOpacity>
      </View>
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
      <TouchableOpacity style={styles.fab} onPress={handleSubmit}>
        <Icon name='checkmark' size={32} color='#FFFFFF' />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 32 : 16,
    width: 56,
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
