import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from '../theme/components/Text';

interface ModalScreenProps {
  onDismiss: () => void;
  children: React.ReactNode;
  dismissText?: string;
}

export function ModalScreen({
  onDismiss,
  children,
  dismissText = 'Cancel',
}: ModalScreenProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral[50],
    },
    header: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
    },
    dismissButton: {
      padding: theme.spacing.sm,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text
            variant='body'
            weight='medium'
            color={theme.colors.neutral[500]}
          >
            {dismissText}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
