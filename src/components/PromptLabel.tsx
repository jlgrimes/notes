import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PromptLabelProps {
  prompt: string;
}

export function PromptLabel({ prompt }: PromptLabelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{prompt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
});
