import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoteForm from './src/components/NoteForm';
import NoteList from './src/components/NoteList';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default function App() {
  const [notes, setNotes] = useState<any[]>([]);
  const [editingNote, setEditingNote] = useState<any>(null);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <NoteForm
          onSubmit={handleSubmit}
          initialContent={editingNote?.content}
          isEditing={!!editingNote}
        />
        <NoteList notes={notes} onEdit={handleEdit} onDelete={handleDelete} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
});
