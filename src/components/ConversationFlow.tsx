import React, { useState } from 'react';
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
import { getSmartSuggestions } from '../lib/ai';

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
  const [currentCard, setCurrentCard] = useState<AnswerCard | null>(null);

  // Initialize with the first card when props change
  React.useEffect(() => {
    if (initialQuery && initialAnswer) {
      const newCard = {
        question: initialQuery,
        answer: initialAnswer,
        smartSuggestions: [],
      };
      setCurrentCard(newCard);
      loadSmartSuggestions(initialAnswer);
    }
  }, [initialQuery, initialAnswer]);

  // Update answer cards when current card is ready with suggestions
  React.useEffect(() => {
    if (currentCard && currentCard.smartSuggestions.length > 0) {
      setAnswerCards(prev => [...prev, currentCard]);
    }
  }, [currentCard]);

  const loadSmartSuggestions = async (answer: string) => {
    setIsLoadingSmartSuggestions(true);
    try {
      const suggestions = await getSmartSuggestions(answer);
      setCurrentCard(prev =>
        prev
          ? {
              ...prev,
              smartSuggestions: suggestions,
            }
          : null
      );
    } catch (error) {
      console.error('Error loading smart suggestions:', error);
    } finally {
      setIsLoadingSmartSuggestions(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    onSuggestionPress(suggestion);
  };

  if (!currentCard) return null;

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
            <Text style={styles.answerText}>{card.answer}</Text>
          </MotiView>

          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsList}>
              {card.smartSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionPill}
                  onPress={() => handleSuggestionPress(suggestion)}
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
          </View>
        </View>
      ))}

      {/* Current card being worked on */}
      <View style={styles.cardContainer}>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: answerCards.length * 100 }}
          style={styles.answerCard}
        >
          <Text style={styles.questionText}>{currentCard.question}</Text>
          <Text style={styles.answerText}>{currentCard.answer}</Text>
        </MotiView>

        <View style={styles.suggestionsContainer}>
          {isLoadingSmartSuggestions ? (
            <View style={styles.loadingContainer}>
              <AILoadingIndicator size={30} color='#4F46E5' />
              <Text style={styles.loadingText}>
                Getting smart suggestions...
              </Text>
            </View>
          ) : currentCard.smartSuggestions.length > 0 ? (
            <View style={styles.suggestionsList}>
              {currentCard.smartSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionPill}
                  onPress={() => handleSuggestionPress(suggestion)}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    marginBottom: 24,
  },
  answerCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 20,
  },
  questionText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 24,
    color: '#374151',
    lineHeight: 32,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsList: {
    flexDirection: 'column',
    gap: 8,
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
