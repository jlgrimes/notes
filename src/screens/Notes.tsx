import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  Platform,
  Keyboard,
} from 'react-native';
import { MotiView } from 'moti';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { NoteForm } from '../components/NoteForm';
import { NoteList } from '../components/NoteList';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { searchNotes, getCommonTopics, getWelcomeMessage } from '../lib/ai';

export function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [isLoadingWelcome, setIsLoadingWelcome] = useState(true);
  const { session, signOut } = useAuth();

  const userFirstName =
    session?.user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    if (session?.user) {
      fetchNotes();
      loadWelcomeMessage();
    }
  }, [session]);

  useEffect(() => {
    if (notes.length > 0) {
      loadSuggestions();
    } else {
      setSuggestions([]);
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
      if (notes.length === 0) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      const topics = await getCommonTopics(notes);
      setSuggestions(topics);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const loadWelcomeMessage = async () => {
    try {
      setIsLoadingWelcome(true);
      const message = await getWelcomeMessage(userFirstName);
      setWelcomeMessage(message);
    } catch (error) {
      console.error('Error loading welcome message:', error);
    } finally {
      setIsLoadingWelcome(false);
    }
  };

  const handleSearchInputPress = () => {
    if (notes.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionPress = async (suggestion: string) => {
    if (notes.length === 0) return;

    Keyboard.dismiss();
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

    if (notes.length === 0) {
      setSearchResult("You haven't written any notes yet.");
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <View style={styles.cardContainer}>
          <View style={styles.aiLoadingContainer}>
            <AILoadingIndicator size={40} color='#4F46E5' />
            <Text style={styles.aiLoadingText}>Analyzing your thoughts...</Text>
            <Text style={styles.aiLoadingSubtext}>
              Finding relevant connections...
            </Text>
          </View>
        </View>
      ) : searchResult || searchQuery ? (
        <View style={styles.cardContainer}>
          <MotiView
            from={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              type: 'timing',
              duration: 800,
              delay: 100,
            }}
            style={styles.searchResultContainer}
          >
            <MotiView
              from={{
                transform: [{ translateY: 10 }],
                scale: 0.98,
              }}
              animate={{
                transform: [{ translateY: 0 }],
                scale: 1,
              }}
              transition={{
                type: 'spring',
                damping: 15,
                mass: 0.8,
              }}
            >
              <Text style={styles.searchResultText}>{searchResult}</Text>
            </MotiView>
          </MotiView>
        </View>
      ) : (
        <View style={styles.cardContainer}>
          {!isLoadingWelcome && (
            <MotiView
              from={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                type: 'timing',
                duration: 800,
              }}
              style={styles.searchResultContainer}
            >
              <Text style={[styles.searchResultText, styles.welcomeText]}>
                {welcomeMessage}
              </Text>
            </MotiView>
          )}
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              setShowSuggestions(false);
            }}
            onFocus={() => setShowSuggestions(true)}
            onPressIn={handleSearchInputPress}
            placeholder='Ask anything about your notes...'
            placeholderTextColor='#9CA3AF'
            style={styles.searchInput}
          />
          {showSuggestions && (
            <MotiView
              style={styles.suggestionsDropdown}
              from={{
                opacity: 0,
                scale: 0.95,
                translateY: -10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                translateY: 0,
              }}
              transition={{
                type: 'spring',
                damping: 20,
                mass: 0.8,
              }}
            >
              {isLoadingSuggestions ? (
                <View style={styles.spinnerContainer}>
                  <AILoadingIndicator size={30} color='#4F46E5' />
                  <Text style={styles.aiLoadingSubtext}>
                    Getting suggestions...
                  </Text>
                </View>
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
            </MotiView>
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
    marginBottom: 24,
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
  cardContainer: {
    minHeight: 200,
    marginBottom: 24,
  },
  searchResultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 32,
    justifyContent: 'center',
    minHeight: 200,
    ...Platform.select({
      web: {
        boxShadow:
          '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  searchResultText: {
    fontSize: 19,
    color: '#374151',
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: -0.3,
    textAlign: 'left',
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
  spinnerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  aiLoadingContainer: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    minHeight: 160,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  aiLoadingText: {
    marginTop: 16,
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
  },
  aiLoadingSubtext: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  welcomeText: {
    color: '#4F46E5',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
