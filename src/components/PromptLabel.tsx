import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from '../theme/components/Text';

interface PromptLabelProps {
  prompt: string;
}

export function PromptLabel({ prompt }: PromptLabelProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <Text variant='body-sm' weight='medium' color={theme.colors.neutral[500]}>
        {prompt}
      </Text>
    </View>
  );
}
