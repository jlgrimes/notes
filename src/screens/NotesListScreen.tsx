import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { MasonryNoteList } from '../components/MasonryNoteList';
import { ModalScreen } from '../components/ModalScreen';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

interface NotesListScreenProps {
  notes: any[];
  onEdit: (id: string) => void;
  loading?: boolean;
  onNotePress?: (note: any) => void;
  onCreateNote?: () => void;
}

export function NotesListScreen({
  notes,
  onEdit,
  loading = false,
  onNotePress,
  onCreateNote,
}: NotesListScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const content = loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size='large' color='#3B82F6' />
    </View>
  ) : notes.length === 0 ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('notes.noNotes')}</Text>
      {onCreateNote && (
        <TouchableOpacity style={styles.createButton} onPress={onCreateNote}>
          <Text style={styles.createButtonText}>{t('notes.newNote')}</Text>
        </TouchableOpacity>
      )}
    </View>
  ) : (
    <MasonryNoteList notes={notes} onEdit={onEdit} />
  );

  return (
    <ModalScreen
      onDismiss={() => navigation.goBack()}
      dismissText={t('common.done')}
    >
      <View style={styles.container}>{content}</View>
    </ModalScreen>
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
});
