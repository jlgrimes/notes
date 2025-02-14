import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SuggestionPillProps {
  suggestion: string;
  onPress: () => void;
  smart?: boolean;
}

export function SuggestionPill({
  suggestion,
  onPress,
  smart = false,
}: SuggestionPillProps) {
  if (smart) {
    return (
      <TouchableOpacity style={styles.pill} onPress={onPress}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientPill}
        >
          <Text style={styles.smartText}>{suggestion}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.pill, styles.regularPill]}
      onPress={onPress}
    >
      <Text style={styles.regularText}>{suggestion}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  gradientPill: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
  },
  regularPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  smartText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  regularText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
});
