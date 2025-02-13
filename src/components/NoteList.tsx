import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  ViewStyle,
} from 'react-native';
import { Note } from './Note';

interface Note {
  id: string;
  content: string;
}

interface NoteListProps {
  notes: Note[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const webGridStyle =
  Platform.OS === 'web'
    ? ({
        display: 'grid' as any,
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      } as ViewStyle)
    : {};

export function NoteList({ notes, onEdit, onDelete }: NoteListProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={[styles.grid, webGridStyle]}>
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
  } as ViewStyle,
  noteWrapper: {
    flex: 1,
    minWidth: 300,
    marginBottom: Platform.OS === 'web' ? 0 : 16,
    marginHorizontal: Platform.OS === 'web' ? 0 : 16,
  },
});
