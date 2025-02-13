import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Session, Provider } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRedirectUrl = () => {
  if (Platform.OS === 'web') {
    return window.location.origin;
  }
  return Linking.createURL('auth-callback');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDeepLink = useCallback(async ({ url }: { url: string }) => {
    console.log('Got deep link:', url);

    if (!url.includes('auth-callback')) {
      console.log('URL does not contain auth-callback, ignoring');
      return;
    }

    try {
      // Parse the URL to get the fragment
      const parsedUrl = new URL(url);
      const fragment = parsedUrl.hash || parsedUrl.search;
      console.log('URL fragment:', fragment);

      // Extract tokens from fragment
      const params = new URLSearchParams(fragment.replace('#', ''));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      console.log('Extracted tokens:', {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
      });

      if (!access_token || !refresh_token) {
        console.error('Missing tokens in URL');
        return;
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('Error setting session:', error);
        return;
      }

      console.log('Session set successfully:', session);
      setSession(session);

      if (Platform.OS !== 'web') {
        await WebBrowser.dismissBrowser();
      }
    } catch (err) {
      console.error('Error processing auth callback:', err);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Handle deep links when app is foregrounded
      const subscription = Linking.addEventListener('url', handleDeepLink);

      // Handle deep links when app is not running
      Linking.getInitialURL().then(url => {
        if (url) {
          console.log('Got initial URL:', url);
          handleDeepLink({ url });
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, [handleDeepLink]);

  useEffect(() => {
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);

      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');
      const redirectUrl = getRedirectUrl();
      console.log('Using redirect URL:', redirectUrl);

      const oAuthOptions = {
        provider: 'google' as Provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      };

      if (Platform.OS !== 'web') {
        // For mobile, we need to open the auth URL in a web browser
        const { data, error } = await supabase.auth.signInWithOAuth({
          ...oAuthOptions,
          options: {
            ...oAuthOptions.options,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          console.error('OAuth setup error:', error);
          throw error;
        }

        if (!data.url) {
          console.error('No OAuth URL returned');
          throw new Error('No OAuth URL returned');
        }

        console.log('Opening auth URL in browser:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
          {
            showInRecents: true,
            dismissButtonStyle: 'close',
            preferEphemeralSession: false,
          }
        );

        console.log('Browser session result:', result);

        if (result.type === 'success') {
          const { url } = result;
          console.log('Auth successful, processing callback URL:', url);

          try {
            // Parse the URL to get any error information
            const parsedUrl = new URL(url);
            console.log('Parsed callback URL:', {
              protocol: parsedUrl.protocol,
              host: parsedUrl.host,
              pathname: parsedUrl.pathname,
              search: parsedUrl.search,
              hash: parsedUrl.hash,
            });

            // Try to exchange the code if present
            const params = new URLSearchParams(
              parsedUrl.search || parsedUrl.hash.replace('#', '')
            );
            const code = params.get('code');

            if (code) {
              console.log(
                'Found authorization code, attempting to exchange...'
              );
              const {
                data: { session: codeSession },
                error: codeError,
              } = await supabase.auth.exchangeCodeForSession(code);

              if (codeError) {
                console.error('Error exchanging code:', codeError);
              } else if (codeSession) {
                console.log('Successfully exchanged code for session');
                setSession(codeSession);
                return;
              }
            }

            // Fallback to waiting for session
            console.log('Falling back to session polling...');
            const maxAttempts = 10; // Increased attempts
            let attempts = 0;

            while (attempts < maxAttempts) {
              console.log(
                `Checking for session (attempt ${attempts + 1}/${maxAttempts})`
              );
              const {
                data: { session: currentSession },
                error: sessionError,
              } = await supabase.auth.getSession();

              if (sessionError) {
                console.error('Error getting session:', sessionError);
                throw sessionError;
              }

              if (currentSession) {
                console.log('Session obtained successfully:', currentSession);
                setSession(currentSession);
                return;
              }

              attempts++;
              // Increased wait time
              await new Promise(resolve => setTimeout(resolve, 2000));
            }

            throw new Error(
              'Could not establish session after multiple attempts'
            );
          } catch (err) {
            console.error('Error processing auth callback:', err);
            throw err;
          }
        } else {
          console.log('Auth was not successful:', result.type);
          throw new Error('Authentication was cancelled or failed');
        }
      } else {
        // Web flow
        console.log('Starting web auth flow');
        const { data, error } = await supabase.auth.signInWithOAuth(
          oAuthOptions
        );

        if (error) {
          console.error('Web OAuth error:', error);
          throw error;
        }

        console.log('Web auth initiated:', data);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
