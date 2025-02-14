import React from 'react';
import {
  Text as RNText,
  TextStyle,
  TextProps as RNTextProps,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import type * as tokens from '../tokens';

type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'button';
type TextWeight = keyof typeof tokens.typography.weights;
type FontSize = keyof typeof tokens.typography.sizes;

interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  style?: TextStyle;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

function variantToSize(variant: TextVariant): FontSize {
  switch (variant) {
    case 'h1':
      return '4xl';
    case 'h2':
      return '3xl';
    case 'h3':
      return '2xl';
    case 'h4':
      return 'xl';
    case 'body':
      return 'base';
    case 'body-sm':
      return 'sm';
    case 'caption':
      return 'xs';
    case 'button':
      return 'base';
    default:
      return 'base';
  }
}

export function Text({
  variant = 'body',
  weight = 'regular',
  color,
  style,
  align,
  children,
  ...props
}: TextProps) {
  const theme = useTheme();
  const fontSize = variantToSize(variant);

  const textStyle: TextStyle = {
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes[fontSize],
    lineHeight:
      theme.typography.sizes[fontSize] * theme.typography.lineHeights.normal,
    fontWeight: theme.typography.weights[weight],
    color: color || theme.colors.neutral[900],
    textAlign: align,
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
}
