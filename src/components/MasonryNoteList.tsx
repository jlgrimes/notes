import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Note } from './Note';
import { useTheme } from '../theme/ThemeProvider';

interface Note {
  id: string;
  content: string;
}

interface MasonryNoteListProps {
  notes: Note[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MasonryNoteList({
  notes,
  onEdit,
  onDelete,
}: MasonryNoteListProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const padding = 16;
  const gap = 12;
  const columnWidth = (width - padding * 2 - gap) / 2;

  // Split notes into two columns, alternating between them
  const leftColumnNotes = notes.filter((_, index) => index % 2 === 0);
  const rightColumnNotes = notes.filter((_, index) => index % 2 === 1);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral[50],
    },
    content: {
      padding: padding,
      flexDirection: 'row',
      gap: gap,
    },
    column: {
      flex: 1,
      gap: gap,
    },
    noteWrapper: {
      width: columnWidth,
      ...Platform.select({
        web: {
          breakInside: 'avoid-column' as any,
        },
      }),
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Left Column */}
        <View style={styles.column}>
          {leftColumnNotes.map(note => (
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

        {/* Right Column */}
        <View style={styles.column}>
          {rightColumnNotes.map(note => (
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
      </View>
    </ScrollView>
  );
}
