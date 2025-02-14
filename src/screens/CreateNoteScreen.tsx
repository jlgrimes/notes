import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NoteForm } from '../components/NoteForm';
import { ModalScreen } from '../components/ModalScreen';
import { useTranslation } from 'react-i18next';

interface CreateNoteScreenProps {
  handleSubmit: (content: string) => void;
  onCancel: () => void;
  initialContent?: string;
}

export function CreateNoteScreen({
  handleSubmit,
  onCancel,
  initialContent,
}: CreateNoteScreenProps) {
  const { t } = useTranslation();

  return (
    <ModalScreen onDismiss={onCancel} dismissText={t('common.cancel')}>
      <View style={styles.container}>
        <NoteForm
          onSubmit={handleSubmit}
          onCancel={onCancel}
          initialContent={initialContent}
          translations={{
            content: t('notes.noteContent'),
            save: t('common.save'),
            cancel: t('common.cancel'),
          }}
        />
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
