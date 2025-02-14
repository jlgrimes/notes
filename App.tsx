import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AuthenticatedApp } from './src/screens/AuthenticatedApp';
import { AuthScreen } from './src/screens/AuthScreen';
import { useAuth } from './src/context/AuthContext';
import './src/lib/i18n'; // Import i18n configuration

function App() {
  const { session } = useAuth();

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          {session ? <AuthenticatedApp /> : <AuthScreen />}
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function AppWrapper() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}
