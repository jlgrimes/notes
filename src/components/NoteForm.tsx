import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';

interface NoteFormProps {
  onSubmit: (title: string, content: string) => void;
  initialContent?: string;
  isEditing?: boolean;
}

export function NoteForm({
  onSubmit,
  initialContent = '',
  isEditing = false,
}: NoteFormProps) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit('', content);
      if (!isEditing) {
        setContent('');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder='Write your note here...'
        placeholderTextColor='#9CA3AF'
        multiline
        style={styles.input}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isEditing ? 'Update Note' : 'Add Note'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    marginBottom: 12,
    color: '#374151',
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
