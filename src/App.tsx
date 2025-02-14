import React from 'react';
import 'react-native-reanimated';
import { AuthProvider } from './context/AuthContext';
import { AuthScreen } from './screens/AuthScreen';
import { AuthenticatedApp } from './screens/AuthenticatedApp';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { session } = useAuth();
  return session ? <AuthenticatedApp /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
