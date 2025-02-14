import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Note } from '../components/Note';
import { useTranslation } from 'react-i18next';

interface NotesListScreenProps {
  notes: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
  onNotePress?: (note: any) => void;
  onCreateNote?: () => void;
}

export function NotesListScreen({
  notes,
  onEdit,
  onDelete,
  loading = false,
  onNotePress,
  onCreateNote,
}: NotesListScreenProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#3B82F6' />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('notes.noNotes')}</Text>
          {onCreateNote && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={onCreateNote}
            >
              <Text style={styles.createButtonText}>{t('notes.newNote')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={({ item }) => (
            <Note
              id={item.id}
              content={item.content}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
});
