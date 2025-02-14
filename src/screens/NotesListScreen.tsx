import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NoteList } from '../components/NoteList';

interface NotesListScreenProps {
  notes: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotesListScreen({
  notes,
  onEdit,
  onDelete,
}: NotesListScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <NoteList notes={notes} onEdit={onEdit} onDelete={onDelete} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
