import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { AILoadingIndicator } from './AILoadingIndicator';
import { getSmartSuggestions, getFollowUpAnswer } from '../lib/ai';

interface ConversationFlowProps {
  initialQuery: string;
  initialAnswer: string;
  onSuggestionPress: (suggestion: string) => void;
}

interface AnswerCard {
  question: string;
  answer: string;
  smartSuggestions: string[];
}

export function ConversationFlow({
  initialQuery,
  initialAnswer,
  onSuggestionPress,
}: ConversationFlowProps) {
  const [answerCards, setAnswerCards] = useState<AnswerCard[]>([]);
  const [isLoadingSmartSuggestions, setIsLoadingSmartSuggestions] =
    useState(false);

  // Initialize with the first card when props change
  useEffect(() => {
    if (initialQuery && initialAnswer) {
      const newCard = {
        question: initialQuery,
        answer: initialAnswer,
        smartSuggestions: [],
      };
      setAnswerCards([newCard]);
      loadSmartSuggestions(initialAnswer, 0);
    }
  }, [initialQuery, initialAnswer]);

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
        smartSuggestions: [],
      },
    ]);

    try {
      // Get the previous answer to use as context
      const previousAnswer = answerCards[previousCardIndex].answer;
      const answer = await getFollowUpAnswer(suggestion, previousAnswer);

      // Update the card with the answer
      setAnswerCards(prev => {
        const updated = [...prev];
        if (updated[newCardIndex]) {
          updated[newCardIndex] = {
            ...updated[newCardIndex],
            answer,
          };
        }
        return updated;
      });

      // Load smart suggestions for this new answer
      await loadSmartSuggestions(answer, newCardIndex);
    } catch (error) {
      console.error('Error handling suggestion:', error);
    }
  };

  if (answerCards.length === 0) return null;

  return (
    <ScrollView style={styles.container}>
      {answerCards.map((card, cardIndex) => (
        <View key={cardIndex} style={styles.cardContainer}>
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: cardIndex * 100 }}
            style={styles.answerCard}
          >
            <Text style={styles.questionText}>{card.question}</Text>
            {card.answer ? (
              <Text style={styles.answerText}>{card.answer}</Text>
            ) : (
              <View style={styles.loadingContainer}>
                <AILoadingIndicator size={30} color='#4F46E5' />
                <Text style={styles.loadingText}>Getting answer...</Text>
              </View>
            )}
          </MotiView>

          {card.answer && cardIndex === answerCards.length - 1 && (
            <View style={styles.suggestionsContainer}>
              {isLoadingSmartSuggestions ? (
                <View style={styles.loadingContainer}>
                  <AILoadingIndicator size={30} color='#4F46E5' />
                  <Text style={styles.loadingText}>
                    Getting smart suggestions...
                  </Text>
                </View>
              ) : card.smartSuggestions?.length > 0 ? (
                <View style={styles.suggestionsList}>
                  {card.smartSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionPill}
                      onPress={() =>
                        handleSuggestionPress(suggestion, cardIndex)
                      }
                    >
                      <LinearGradient
                        colors={['#4F46E5', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.suggestionPillGradient}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    marginBottom: 12,
  },
  answerCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 6,
  },
  answerText: {
    fontSize: 24,
    color: '#374151',
    lineHeight: 32,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsList: {
    flexDirection: 'column',
    gap: 6,
    paddingHorizontal: 16,
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});
