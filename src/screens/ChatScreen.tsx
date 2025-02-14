import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MotiView } from 'moti';
import { NoteForm } from '../components/NoteForm';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { searchNotes, getSmartSuggestions, getFollowUpAnswer } from '../lib/ai';
import { ConversationFlow } from '../components/ConversationFlow';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SuggestionPillList } from '../components/SuggestionPillList';
import { ModalOverlay } from '../components/ModalOverlay';
import { PromptLabel } from '../components/PromptLabel';
import { welcomeAnimation, fadeIn, slideUpAndFadeIn } from '../lib/animations';

type RootStackParamList = {
  MainTabs: undefined;
  CreateNoteModal: { mode: 'create' };
  Conversation: {
    initialQuery: string;
    initialAnswer: string;
    onSuggestionPress: (suggestion: string) => void;
    previousAnswer: string;
  };
  NotesListModal: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ChatScreenProps {
  notes: any[];
  isSearching: boolean;
  searchResult: string;
  searchQuery: string;
  isLoadingWelcome: boolean;
  welcomeMessage: string;
  setSearchQuery: (query: string) => void;
  setSearchResult: (result: string) => void;
  setShowSuggestions: (show: boolean) => void;
  handleSearchInputPress: () => void;
  showSuggestions: boolean;
  isLoadingSuggestions: boolean;
  suggestions: string[];
  handleSuggestionPress: (suggestion: string) => void;
  handleSearch: (query: string) => void;
  handleSubmit: (title: string, content: string) => void;
  editingNote: any;
}

export function ChatScreen(props: ChatScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [isLoadingSmartSuggestions, setIsLoadingSmartSuggestions] =
    useState(false);

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
    setSearchResult,
    isSearching,
    handleSearch,
    handleSuggestionPress,
  } = props;

  // Load smart suggestions when we get a search result
  useEffect(() => {
    if (searchResult) {
      loadSmartSuggestions();
    } else {
      setSmartSuggestions([]);
    }
  }, [searchResult]);

  const loadSmartSuggestions = async () => {
    setIsLoadingSmartSuggestions(true);
    try {
      const suggestions = await getSmartSuggestions(searchResult);
      setSmartSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading smart suggestions:', error);
    } finally {
      setIsLoadingSmartSuggestions(false);
    }
  };

  const handleSmartSuggestionPress = async (suggestion: string) => {
    // First dismiss the modal
    dismissResults();

    // Then navigate to conversation screen
    // @ts-ignore - navigation type is complex here
    navigation.navigate('Conversation', {
      initialQuery: suggestion,
      initialAnswer: '', // Start with empty answer
      onSuggestionPress: handleSmartSuggestionPress,
      previousAnswer: searchResult, // Pass the previous answer for context
    });
  };

  const handleRegularSuggestionPress = async (suggestion: string) => {
    await setSearchQuery(suggestion);
    // Small timeout to ensure state is updated
    setTimeout(() => {
      handleSearch(suggestion);
    }, 0);
  };

  const handleSearchWithSmartSuggestions = () => {
    handleSearch(searchQuery);
  };

  const dismissResults = () => {
    setSearchQuery('');
    setSearchResult('');
    setSmartSuggestions([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.topContent}>
          <View style={styles.welcomeContainer}>
            {!isLoadingWelcome && (
              <MotiView {...welcomeAnimation}>
                <MaskedView
                  style={styles.maskedView}
                  maskElement={
                    <Text style={[styles.welcomeText]}>{welcomeMessage}</Text>
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

          <ModalOverlay
            visible={!!searchResult || isSearching}
            onDismiss={dismissResults}
          >
            {isSearching
              ? null
              : searchResult && (
                  <>
                    <View style={styles.cardContainer}>
                      <MotiView {...fadeIn}>
                        {searchQuery && <PromptLabel prompt={searchQuery} />}
                      </MotiView>
                      <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                          <Text style={styles.searchResultText}>
                            {searchResult}
                          </Text>
                        </MotiView>
                      </MotiView>
                    </View>
                    <SuggestionPillList
                      suggestions={
                        isLoadingSmartSuggestions ? undefined : smartSuggestions
                      }
                      onSuggestionPress={handleSmartSuggestionPress}
                      smart
                    />
                  </>
                )}
          </ModalOverlay>
        </View>

        <View style={styles.bottomContent}>
          {!searchResult && (
            <View style={styles.suggestionsContainer}>
              <SuggestionPillList
                suggestions={isLoadingSuggestions ? undefined : suggestions}
                onSuggestionPress={handleRegularSuggestionPress}
              />
              <TouchableOpacity
                style={styles.browseAllLink}
                onPress={() => navigation.navigate('NotesListModal')}
              >
                <Text style={styles.browseAllText}>Browse all notes</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
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
              onPress={handleSearchWithSmartSuggestions}
              style={styles.searchButton}
              disabled={isSearching}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 90 : 60, // Account for tab bar height
  },
  topContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  welcomeContainer: {
    marginBottom: 24,
    height: 100,
  },
  welcomeBlock: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 0,
    paddingVertical: 16,
    justifyContent: 'center',
    height: '100%',
  },
  cardContainer: {
    marginBottom: 24,
  },
  bottomContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#f7f7f7',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
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
    paddingVertical: 32,
    paddingHorizontal: 24,
    justifyContent: 'center',
    minHeight: 160,
    ...Platform.select({
      web: {
        boxShadow:
          '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
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
    flexDirection: 'row',
    height: '100%',
  },
  gradientContainer: {
    flex: 1,
    height: '100%',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'left',
    color: 'black',
    lineHeight: 36,
  },
  smartSuggestionPill: {
    borderWidth: 0,
    overflow: 'hidden',
  },
  smartSuggestionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  suggestionsContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  browseAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  browseAllText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    color: '#4F46E5',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '600',
  },
  searchResultsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
});
