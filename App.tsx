import React from 'react';
import 'react-native-reanimated';
import { AuthProvider } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { AuthenticatedApp } from '@/screens/AuthenticatedApp';
import { useAuth } from './src/context/AuthContext';

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  return session ? <AuthenticatedApp /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
