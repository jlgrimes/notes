import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto focus the input when component mounts
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    // Set up keyboard listeners
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        const height = e.endCoordinates.height;
        // On iOS, add extra space for the input accessories bar
        setKeyboardHeight(Platform.OS === 'ios' ? height + 45 : height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    // Clean up listeners
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

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
        ref={inputRef}
        value={content}
        onChangeText={setContent}
        placeholder='Write your note here...'
        placeholderTextColor='#9CA3AF'
        multiline
        style={styles.input}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        style={[
          styles.fab,
          {
            bottom:
              keyboardHeight > 0
                ? keyboardHeight
                : Platform.OS === 'ios'
                ? 40
                : 24,
          },
        ]}
        activeOpacity={0.8}
      >
        <Icon name='checkmark-sharp' size={24} color='#FFFFFF' />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 24,
    color: '#374151',
    fontSize: 20,
    lineHeight: 28,
    textAlignVertical: 'top',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
