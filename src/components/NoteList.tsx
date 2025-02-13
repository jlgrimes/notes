import React from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import { Note } from './Note';

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NoteListProps {
  notes: Note[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NoteList({ notes, onEdit, onDelete }: NoteListProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        {notes.map(note => (
          <View key={note.id} style={styles.noteWrapper}>
            <Note
              id={note.id}
              content={note.content}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'column',
    gap: 16,
    ...Platform.select({
      web: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      },
    }),
  },
  noteWrapper: {
    flex: 1,
    minWidth: 300,
    marginBottom: Platform.OS === 'web' ? 0 : 16,
  },
});
