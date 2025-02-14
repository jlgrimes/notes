import React from 'react';
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

interface HomeScreenProps {
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

export function HomeScreen(props: HomeScreenProps) {
  const {
    isSearching,
    searchResult,
    searchQuery,
    isLoadingWelcome,
    welcomeMessage,
    setSearchQuery,
    setShowSuggestions,
    handleSearchInputPress,
    showSuggestions,
    isLoadingSuggestions,
    suggestions,
    handleSuggestionPress,
    handleSearch,
    handleSubmit,
    editingNote,
  } = props;

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
                from={{ opacity: 0, scale: 0.95, translateY: -10 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 20, mass: 0.8 }}
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
            onPress={handleSearch}
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
    minHeight: 200,
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: 'black',
  },
});
