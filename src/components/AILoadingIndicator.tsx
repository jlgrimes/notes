import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { loadingBarAnimation } from '../lib/animations';

const bars = Array.from({ length: 3 });

interface AILoadingIndicatorProps {
  size?: number;
  color?: string;
}

export function AILoadingIndicator({
  size = 40,
  color = '#000000',
}: AILoadingIndicatorProps) {
  return (
    <View style={[styles.container, { width: size }]}>
      {bars.map((_, i) => (
        <MotiView
          key={i}
          style={[styles.bar, { backgroundColor: color }]}
          {...loadingBarAnimation(i * 100)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 20,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});
