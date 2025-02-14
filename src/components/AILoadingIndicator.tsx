import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

export const AILoadingIndicator = ({ size = 40, color = '#4F46E5' }) => {
  // Create 3 dots that will animate in a wave pattern
  const dots = Array.from({ length: 3 });

  return (
    <View style={[styles.container, { width: size * 3, height: size }]}>
      {/* Background pulse effect */}
      <MotiView
        style={[
          styles.pulse,
          {
            width: size * 2,
            height: size * 2,
            backgroundColor: color,
          },
        ]}
        from={{
          scale: 1,
          opacity: 0.3,
        }}
        animate={{
          scale: 1.8,
          opacity: 0,
        }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
        }}
      />

      {/* Animated dots */}
      {dots.map((_, i) => (
        <MotiView
          key={i}
          style={[
            styles.dot,
            {
              width: size / 3,
              height: size / 3,
              backgroundColor: color,
            },
          ]}
          from={{
            scale: 0.5,
            opacity: 0.3,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
            delay: i * 200,
            repeatReverse: true,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: 100,
  },
  pulse: {
    position: 'absolute',
    borderRadius: 100,
    alignSelf: 'center',
  },
});
