import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { NoteForm } from '../components/NoteForm';
import { NoteList } from '../components/NoteList';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [editingNote, setEditingNote] = useState<any>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }

    setNotes(data || []);
  };

  const handleSubmit = async (title: string, content: string) => {
    if (editingNote) {
      const { error } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', editingNote.id);

      if (error) {
        console.error('Error updating note:', error);
        return;
      }

      setEditingNote(null);
    } else {
      const { error } = await supabase
        .from('notes')
        .insert([{ title, content }]);

      if (error) {
        console.error('Error creating note:', error);
        return;
      }
    }

    fetchNotes();
  };

  const handleEdit = (id: string) => {
    const note = notes.find(n => n.id === id);
    setEditingNote(note);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      return;
    }

    fetchNotes();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <NoteForm
        onSubmit={handleSubmit}
        initialContent={editingNote?.content}
        isEditing={!!editingNote}
      />
      <NoteList notes={notes} onEdit={handleEdit} onDelete={handleDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
});
