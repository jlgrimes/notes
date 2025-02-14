import React from 'react';
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
      <AppContent />
    </AuthProvider>
  );
}
