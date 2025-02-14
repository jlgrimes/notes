import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from '../theme/components/Text';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: theme.colors.neutral[50],
    },
    container: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.neutral[50],
    },
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Text variant='h3' weight='bold' color={theme.colors.neutral[800]}>
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
}
