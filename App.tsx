import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import 'react-native-reanimated';
import { AuthProvider } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { Notes } from './src/screens/Notes';
import { useAuth } from './src/context/AuthContext';

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  return session ? <Notes /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <AppContent />
        </View>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
});
