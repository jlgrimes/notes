import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SmartSuggestionPillProps {
  suggestion: string;
  onPress: () => void;
}

export function SmartSuggestionPill({
  suggestion,
  onPress,
}: SmartSuggestionPillProps) {
  return (
    <TouchableOpacity style={styles.suggestionPill} onPress={onPress}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.suggestionPillGradient}
      >
        <Text style={styles.suggestionText}>{suggestion}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
