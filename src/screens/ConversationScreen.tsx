import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { ConversationFlow } from '../components/ConversationFlow';
import { getFollowUpAnswer } from '../lib/ai';
import { LocationReference } from '@/lib/ai.types';

interface ConversationScreenProps {
  route: {
    params: {
      initialQuery: string;
      initialAnswer: string;
      previousAnswer: string;
      onSuggestionPress: (suggestion: string) => void;
    };
  };
}

export function ConversationScreen({ route }: ConversationScreenProps) {
  const [query, setQuery] = useState(route.params.initialQuery);
  const [answer, setAnswer] = useState(route.params.initialAnswer);
  const [locations, setLocations] = useState<LocationReference[]>([]);
  const { onSuggestionPress, previousAnswer } = route.params;

  // Fetch answer when component mounts
  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        const result = await getFollowUpAnswer(query, previousAnswer);
        setAnswer(result.answer);
        setLocations(result.locations);
      } catch (error) {
        console.error('Error getting answer:', error);
      }
    };

    if (!answer && query) {
      fetchAnswer();
    }
  }, [query, previousAnswer]);

  return (
    <SafeAreaView style={styles.container}>
      <ConversationFlow
        initialQuery={query}
        initialAnswer={answer}
        initialLocations={locations}
        onSuggestionPress={onSuggestionPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
});
