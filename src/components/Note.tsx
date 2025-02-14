import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface NoteProps {
  id: string;
  content: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Note({ id, content, onEdit, onDelete }: NoteProps) {
  const { t } = useTranslation();
  const date = new Date(content.split(' ')[0]);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(id)}
          style={[styles.button, styles.editButton]}
        >
          <Feather name='edit-2' size={16} color='#6B7280' />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(id)}
          style={[styles.button, styles.deleteButton]}
        >
          <Feather name='trash-2' size={16} color='#6B7280' />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderWidth: 1,
        borderColor: '#F3F4F6',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  buttonText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
});
