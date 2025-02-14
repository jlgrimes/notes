import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { getSmartSuggestions, getFollowUpAnswer } from '../lib/ai';
import { SuggestionPill } from './SuggestionPill';
import { LocationCard } from './LocationCard';
import { PromptLabel } from './PromptLabel';
import { fadeIn } from '../lib/animations';
import { SuggestionPillList } from './SuggestionPillList';

interface LocationReference {
  name: string;
  address?: string;
  placeId?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface AnswerCard {
  question: string;
  answer: string;
  locations: LocationReference[];
  smartSuggestions: string[];
}

interface ConversationFlowProps {
  initialQuery: string;
  initialAnswer: string;
  initialLocations: LocationReference[];
  onSuggestionPress: (suggestion: string) => void;
}

export function ConversationFlow({
  initialQuery,
  initialAnswer,
  initialLocations,
  onSuggestionPress,
}: ConversationFlowProps) {
  const [answerCards, setAnswerCards] = useState<AnswerCard[]>([]);
  const [isLoadingSmartSuggestions, setIsLoadingSmartSuggestions] =
    useState(false);

  // Initialize with the first card when props change
  useEffect(() => {
    if (initialQuery) {
      const newCard = {
        question: initialQuery,
        answer: initialAnswer,
        locations: initialLocations,
        smartSuggestions: [],
      };
      setAnswerCards([newCard]);
      if (initialAnswer) {
        loadSmartSuggestions(initialAnswer, 0);
      }
    }
  }, [initialQuery, initialAnswer, initialLocations]);

  const loadSmartSuggestions = async (answer: string, cardIndex: number) => {
    setIsLoadingSmartSuggestions(true);
    try {
      const suggestions = await getSmartSuggestions(answer);
      setAnswerCards(prev => {
        const updated = [...prev];
        if (updated[cardIndex]) {
          updated[cardIndex] = {
            ...updated[cardIndex],
            smartSuggestions: suggestions,
          };
        }
        return updated;
      });
    } catch (error) {
      console.error('Error loading smart suggestions:', error);
    } finally {
      setIsLoadingSmartSuggestions(false);
    }
  };

  const handleSuggestionPress = async (
    suggestion: string,
    previousCardIndex: number
  ) => {
    // Add a new card in loading state
    const newCardIndex = previousCardIndex + 1;
    setAnswerCards(prev => [
      ...prev,
      {
        question: suggestion,
        answer: '',
        locations: [],
        smartSuggestions: [],
      },
    ]);

    try {
      // Get the previous answer to use as context
      const previousAnswer = answerCards[previousCardIndex].answer;
      const result = await getFollowUpAnswer(suggestion, previousAnswer);

      // Update the card with the answer and locations
      setAnswerCards(prev => {
        const updated = [...prev];
        if (updated[newCardIndex]) {
          updated[newCardIndex] = {
            ...updated[newCardIndex],
            answer: result.answer,
            locations: result.locations,
          };
        }
        return updated;
      });

      // Load smart suggestions for this new answer
      await loadSmartSuggestions(result.answer, newCardIndex);
    } catch (error) {
      console.error('Error handling suggestion:', error);
    }
  };

  if (answerCards.length === 0) return null;

  return (
    <ScrollView style={styles.container}>
      {answerCards.map((card, cardIndex) => (
        <MotiView key={cardIndex} {...fadeIn} style={styles.cardContainer}>
          <View style={styles.answerCard}>
            <PromptLabel prompt={card.question} />
            {card.answer && (
              <MotiView {...fadeIn}>
                <Text style={styles.answerText}>{card.answer}</Text>
                {card.locations.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.locationsContainer}
                    contentContainerStyle={styles.locationsContentContainer}
                  >
                    {card.locations.map((location, index) => (
                      <LocationCard key={index} location={location} />
                    ))}
                  </ScrollView>
                )}
              </MotiView>
            )}
          </View>

          {card.answer && cardIndex === answerCards.length - 1 && (
            <View style={styles.suggestionsContainer}>
              <SuggestionPillList
                suggestions={
                  isLoadingSmartSuggestions ? undefined : card.smartSuggestions
                }
                onSuggestionPress={suggestion =>
                  handleSuggestionPress(suggestion, cardIndex)
                }
                smart={true}
              />
            </View>
          )}
        </MotiView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardContainer: {
    marginBottom: 24,
  },
  answerCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 24,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 26,
    letterSpacing: -0.3,
    marginTop: 12,
  },
  locationsContainer: {
    marginTop: 24,
    marginLeft: -16,
    marginRight: -16,
  },
  locationsContentContainer: {
    paddingHorizontal: 16,
  },
  suggestionsContainer: {
    marginTop: 24,
  },
  suggestionsList: {
    flexDirection: 'column',
    gap: 12,
  },
  suggestionPill: {
    borderRadius: 100,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  suggestionPillGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  suggestionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
});
