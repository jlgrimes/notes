import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { NoteForm } from '../components/NoteForm';
import { NoteList } from '../components/NoteList';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { searchNotes, getCommonTopics } from '../lib/ai';

export function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { session, signOut } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchNotes();
    }
  }, [session]);

  useEffect(() => {
    if (notes.length > 0) {
      loadSuggestions();
    }
  }, [notes]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    if (Platform.OS === 'web') {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, []);

  const loadSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      const topics = await getCommonTopics(notes);
      setSuggestions(topics);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearchInputPress = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionPress = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        Alert.alert('Error', 'Failed to fetch notes. Please try again.');
        return;
      }

      setNotes(data || []);
      if (data && data.length > 0) {
        await loadSuggestions();
      }
    } catch (error) {
      console.error('Error in fetchNotes:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while fetching notes.'
      );
    }
  };

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a search query.');
      return;
    }

    try {
      setIsSearching(true);
      const result = await searchNotes(query, notes);
      setSearchResult(result);
    } catch (error) {
      console.error('Error searching notes:', error);
      Alert.alert('Error', 'Failed to search notes. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (title: string, content: string) => {
    try {
      if (!session?.user) {
        Alert.alert('Error', 'You must be signed in to create notes.');
        return;
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({ title, content })
          .eq('id', editingNote.id)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error updating note:', error);
          Alert.alert('Error', 'Failed to update note. Please try again.');
          return;
        }

        setEditingNote(null);
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{ title, content, user_id: session.user.id }]);

        if (error) {
          console.error('Error creating note:', error);
          Alert.alert('Error', 'Failed to create note. Please try again.');
          return;
        }
      }

      fetchNotes();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while saving the note.'
      );
    }
  };

  const handleEdit = (id: string) => {
    const note = notes.find(n => n.id === id);
    setEditingNote(note);
  };

  const handleDelete = async (id: string) => {
    try {
      if (!session?.user) {
        Alert.alert('Error', 'You must be signed in to delete notes.');
        return;
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting note:', error);
        Alert.alert('Error', 'Failed to delete note. Please try again.');
        return;
      }

      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error in handleDelete:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while deleting the note.'
      );
    }
  };

  if (!session?.user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please sign in to view your notes.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSuggestions(true)}
            onPressIn={handleSearchInputPress}
            placeholder='Ask anything about your notes...'
            placeholderTextColor='#9CA3AF'
            style={styles.searchInput}
          />
          {showSuggestions && (
            <View style={styles.suggestionsDropdown}>
              {isLoadingSuggestions ? (
                <ActivityIndicator size='small' color='#4F46E5' />
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.suggestionItem,
                      index === suggestions.length - 1 &&
                        styles.suggestionItemLast,
                    ]}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noSuggestionsText}>
                  No suggestions available
                </Text>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleSearch()}
          style={styles.searchButton}
          disabled={isSearching}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#4F46E5' />
          <Text style={styles.loadingText}>Searching notes...</Text>
        </View>
      ) : searchResult ? (
        <View style={styles.searchResultContainer}>
          <Text style={styles.searchResultTitle}>Search Result:</Text>
          <Text style={styles.searchResultText}>{searchResult}</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchResult('');
              setSearchQuery('');
            }}
          >
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <NoteForm
        onSubmit={handleSubmit}
        initialContent={editingNote?.content}
        isEditing={!!editingNote}
      />
      <NoteList notes={notes} onEdit={handleEdit} onDelete={handleDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    color: '#374151',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#4F46E5',
    fontSize: 16,
  },
  searchResultContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  searchResultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  searchResultText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  clearButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    padding: 8,
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      default: {
        elevation: 3,
      },
    }),
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: 16,
    color: '#374151',
  },
  noSuggestionsText: {
    padding: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
