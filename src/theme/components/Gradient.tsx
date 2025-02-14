import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ThemeProvider';

type GradientType = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface GradientProps {
  type?: GradientType;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  colors?: [string, string];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function Gradient({
  type = 'primary',
  style,
  children,
  colors: customColors,
  start: customStart,
  end: customEnd,
}: GradientProps) {
  const theme = useTheme();
  const gradientConfig = theme.gradients[type];
  const colors = customColors || (gradientConfig.colors as [string, string]);

  return (
    <LinearGradient
      colors={colors}
      start={customStart || gradientConfig.start}
      end={customEnd || gradientConfig.end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
