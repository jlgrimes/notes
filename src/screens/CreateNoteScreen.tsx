import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NoteForm } from '../components/NoteForm';
import { useTranslation } from 'react-i18next';

interface CreateNoteScreenProps {
  handleSubmit: (note: { title: string; content: string }) => void;
  onCancel: () => void;
  initialNote?: { title: string; content: string };
  mode?: 'create' | 'edit';
}

export function CreateNoteScreen({
  handleSubmit,
  onCancel,
  initialNote,
  mode = 'create',
}: CreateNoteScreenProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <NoteForm
        onSubmit={handleSubmit}
        onCancel={onCancel}
        initialNote={initialNote}
        mode={mode}
        translations={{
          title: t('notes.noteTitle'),
          content: t('notes.noteContent'),
          save: t('common.save'),
          cancel: t('common.cancel'),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
