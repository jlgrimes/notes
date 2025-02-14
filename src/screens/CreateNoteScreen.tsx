import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { MotiView } from 'moti';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { NoteForm } from '../components/NoteForm';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { searchNotes } from '../lib/ai';
import { ConversationFlow } from '../components/ConversationFlow';

interface CreateNoteScreenProps {
  notes: any[];
  isSearching: boolean;
  searchResult: string;
  searchQuery: string;
  isLoadingWelcome: boolean;
  welcomeMessage: string;
  setSearchQuery: (query: string) => void;
  setShowSuggestions: (show: boolean) => void;
  handleSearchInputPress: () => void;
  showSuggestions: boolean;
  isLoadingSuggestions: boolean;
  suggestions: string[];
  handleSuggestionPress: (suggestion: string) => void;
  handleSearch: () => void;
  handleSubmit: (title: string, content: string) => void;
  editingNote: any;
}

export function CreateNoteScreen(props: CreateNoteScreenProps) {
  const [showConversation, setShowConversation] = useState(false);

  const {
    notes,
    isLoadingWelcome,
    welcomeMessage,
    isLoadingSuggestions,
    suggestions,
    editingNote,
    searchQuery,
    setSearchQuery,
    searchResult,
    isSearching,
    handleSearch,
    handleSuggestionPress,
  } = props;

  const handleSuggestionPressWithConversation = (suggestion: string) => {
    handleSuggestionPress(suggestion);
    setShowConversation(true);
  };

  const handleSearchWithConversation = () => {
    handleSearch();
    setShowConversation(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
        {isSearching ? (
          <View style={styles.cardContainer}>
            <View style={styles.aiLoadingContainer}>
              <AILoadingIndicator size={40} color='#4F46E5' />
              <Text style={styles.aiLoadingText}>
                Analyzing your thoughts...
              </Text>
              <Text style={styles.aiLoadingSubtext}>
                Finding relevant connections...
              </Text>
            </View>
          </View>
        ) : searchResult || searchQuery ? (
          showConversation ? (
            <ConversationFlow
              key={`${searchQuery}-${searchResult}`}
              initialQuery={searchQuery}
              initialAnswer={searchResult}
              onSuggestionPress={handleSuggestionPressWithConversation}
            />
          ) : (
            <View style={styles.cardContainer}>
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'timing', duration: 800, delay: 100 }}
                style={styles.searchResultContainer}
              >
                <MotiView
                  from={{ transform: [{ translateY: 10 }], scale: 0.98 }}
                  animate={{ transform: [{ translateY: 0 }], scale: 1 }}
                  transition={{ type: 'spring', damping: 15, mass: 0.8 }}
                >
                  <Text style={styles.searchResultText}>{searchResult}</Text>
                </MotiView>
              </MotiView>
            </View>
          )
        ) : (
          <View style={styles.cardContainer}>
            {!isLoadingWelcome && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'timing', duration: 800 }}
                style={styles.searchResultContainer}
              >
                <MaskedView
                  style={styles.maskedView}
                  maskElement={
                    <Text style={[styles.searchResultText, styles.welcomeText]}>
                      {welcomeMessage}
                    </Text>
                  }
                >
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED', '#DB2777']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientContainer}
                  />
                </MaskedView>
              </MotiView>
            )}
          </View>
        )}

        {!searchResult && !showConversation && (
          <>
            {isLoadingSuggestions ? (
              <View style={styles.spinnerContainer}>
                <AILoadingIndicator size={30} color='#4F46E5' />
                <Text style={styles.aiLoadingSubtext}>
                  Getting suggestions...
                </Text>
              </View>
            ) : suggestions.length > 0 ? (
              <View style={styles.suggestionsList}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionPill}
                    onPress={() =>
                      handleSuggestionPressWithConversation(suggestion)
                    }
                  >
                    <Text style={styles.suggestionPillText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </>
        )}

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder='Ask anything about your notes...'
              placeholderTextColor='#9CA3AF'
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            onPress={handleSearchWithConversation}
            style={styles.searchButton}
            disabled={isSearching}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <NoteForm
          onSubmit={props.handleSubmit}
          initialContent={editingNote?.content}
          isEditing={!!editingNote}
        />
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
  cardContainer: {
    minHeight: 160,
    marginBottom: 0,
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
  searchResultContainer: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 32,
    justifyContent: 'center',
    minHeight: 160,
    marginBottom: 0,
  },
  searchResultText: {
    fontSize: 24,
    color: '#374151',
    lineHeight: 32,
    fontWeight: '500',
    letterSpacing: -0.3,
    textAlign: 'left',
  },
  suggestionsList: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  suggestionPill: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  suggestionPillText: {
    fontSize: 16,
    color: '#4F46E5',
    textAlign: 'left',
  },
  spinnerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 24,
  },
  aiLoadingContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 24,
    minHeight: 160,
    justifyContent: 'center',
  },
  aiLoadingText: {
    marginTop: 16,
    color: '#4F46E5',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  aiLoadingSubtext: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  maskedView: {
    flex: 1,
    flexDirection: 'row',
    height: 'auto',
  },
  gradientContainer: {
    flex: 1,
    height: '100%',
    padding: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'left',
    color: 'black',
    lineHeight: 36,
  },
});
