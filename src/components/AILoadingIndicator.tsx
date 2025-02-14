import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

export const AILoadingIndicator = ({ size = 40, color = '#4F46E5' }) => {
  const bars = Array.from({ length: 3 });
  const barWidth = size / 4;

  return (
    <View style={[styles.container, { height: size }]}>
      {bars.map((_, i) => (
        <MotiView
          key={i}
          style={[
            styles.bar,
            {
              width: barWidth,
              height: size,
              backgroundColor: color,
              marginHorizontal: barWidth / 4,
            },
          ]}
          from={{
            height: size * 0.4,
            opacity: 0.3,
          }}
          animate={{
            height: [size * 0.4, size * 0.8, size * 0.4],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            type: 'timing',
            duration: 1600,
            loop: true,
            delay: i * 220,
            repeatReverse: false,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    borderRadius: 2,
  },
});
