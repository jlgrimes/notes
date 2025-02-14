import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { AuthenticatedApp } from './src/screens/AuthenticatedApp';
import { AuthScreen } from './src/screens/AuthScreen';
import { useAuth } from './src/context/AuthContext';
import './src/lib/i18n'; // Import i18n configuration

function App() {
  const { session } = useAuth();

  return (
    <NavigationContainer>
      {session ? <AuthenticatedApp /> : <AuthScreen />}
    </NavigationContainer>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
