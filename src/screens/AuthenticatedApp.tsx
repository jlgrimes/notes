import React, { useState, useEffect } from 'react';
import { Alert, Platform, View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { CreateNoteScreen } from './CreateNoteScreen';
import { ChatScreen } from './ChatScreen';
import { ConversationScreen } from './ConversationScreen';
import { NotesListScreen } from './NotesListScreen';
import { SettingsScreen } from './SettingsScreen';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { searchNotes, getCommonTopics, getWelcomeMessage } from '../lib/ai';
import { Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';

const Tab = createBottomTabNavigator();

type RootStackParamList = {
  MainTabs: undefined;
  CreateNoteModal: { mode: 'create' | 'edit' };
  Conversation: {
    initialQuery: string;
    initialAnswer: string;
    onSuggestionPress: (suggestion: string) => void;
    previousAnswer: string;
  };
  NotesListModal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function ChatScreenWrapper(props: any) {
  return <ChatScreen {...props} mode='chat' />;
}

function TabNavigator({ screenProps }: any) {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { setEditingNote } = screenProps;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === t('common.chat')) {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === t('notes.title')) {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === t('common.settings')) {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.neutral[500],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          backgroundColor: theme.colors.neutral[50],
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopRightRadius: theme.borderRadius.xl,
          borderTopLeftRadius: theme.borderRadius.xl,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name={t('common.chat')}>
        {() => <ChatScreenWrapper {...screenProps} />}
      </Tab.Screen>
      <Tab.Screen
        name={t('notes.newNote')}
        component={View}
        options={{
          tabBarButton: () => (
            <TouchableOpacity
              style={{
                top: -20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setEditingNote(null);
                navigation.navigate('CreateNoteModal', { mode: 'create' });
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: theme.colors.primary[500],
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...theme.shadows.lg,
                }}
              >
                <Icon name='add' size={32} color={theme.colors.neutral[50]} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen name={t('common.settings')}>
        {() => <SettingsScreen signOut={screenProps.signOut} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function AuthenticatedApp() {
  const { session, signOut } = useAuth();
  const { t } = useTranslation();
  const [notes, setNotes] = useState<any[]>([]);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [isLoadingWelcome, setIsLoadingWelcome] = useState(true);
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    if (session?.user) {
      fetchNotes();
      loadWelcomeMessage();
    }
  }, [session]);

  useEffect(() => {
    if (notes.length > 0) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [notes]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    if (Platform.OS === 'web') {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, []);

  const loadSuggestions = async () => {
    try {
      if (notes.length === 0) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      const topics = await getCommonTopics(notes);
      setSuggestions(topics);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const loadWelcomeMessage = async () => {
    try {
      setIsLoadingWelcome(true);
      const userFirstName =
        session?.user?.user_metadata?.full_name?.split(' ')[0] || 'there';
      const message = await getWelcomeMessage(userFirstName);
      setWelcomeMessage(message);
    } catch (error) {
      console.error('Error loading welcome message:', error);
    } finally {
      setIsLoadingWelcome(false);
    }
  };

  const handleSearchInputPress = () => {
    if (notes.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      Alert.alert('Error', t('notes.errors.pleaseEnterQuery'));
      return;
    }

    if (notes.length === 0) {
      setSearchResult(t('notes.errors.noMemosYet'));
      return;
    }

    try {
      setIsSearching(true);
      const result = await searchNotes(query, notes);
      setSearchQuery(query);
      setSearchResult(result);
    } catch (error) {
      console.error('Error searching memos:', error);
      Alert.alert('Error', t('notes.errors.failedToFetch'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    if (notes.length === 0) return;
    Keyboard.dismiss();
    handleSearch(suggestion);
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching memos:', error);
        Alert.alert('Error', t('notes.errors.failedToFetch'));
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error('Error in fetchNotes:', error);
      Alert.alert('Error', t('notes.errors.unexpectedError'));
    }
  };

  const handleSubmit = async (content: string) => {
    try {
      if (!session?.user) {
        Alert.alert('Error', t('notes.errors.mustBeSignedIn'));
        return;
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({ content })
          .eq('id', editingNote.id)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error updating memo:', error);
          Alert.alert('Error', t('notes.errors.failedToUpdate'));
          return;
        }

        setEditingNote(null);
      } else {
        const { error } = await supabase.from('notes').insert([
          {
            content,
            user_id: session.user.id,
          },
        ]);

        if (error) {
          console.error('Error creating memo:', error);
          Alert.alert('Error', t('notes.errors.failedToCreate'));
          return;
        }
      }

      fetchNotes();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', t('notes.errors.unexpectedError'));
    }
  };

  const handleEdit = (id: string) => {
    const note = notes.find(n => n.id === id);
    setEditingNote(note);
    navigation.navigate('CreateNoteModal', { mode: 'edit' });
  };

  const handleDelete = async (id: string) => {
    try {
      if (!session?.user) {
        Alert.alert('Error', t('notes.errors.mustBeSignedIn'));
        return;
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting memo:', error);
        Alert.alert('Error', t('notes.errors.failedToDelete'));
        return;
      }

      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error in handleDelete:', error);
      Alert.alert('Error', t('notes.errors.unexpectedError'));
    }
  };

  const screenProps = {
    notes,
    isSearching,
    searchResult,
    searchQuery,
    isLoadingWelcome,
    welcomeMessage,
    setSearchQuery,
    setSearchResult,
    setShowSuggestions,
    handleSearchInputPress,
    showSuggestions,
    isLoadingSuggestions,
    suggestions,
    handleSuggestionPress,
    handleSearch,
    handleSubmit,
    handleEdit,
    editingNote,
    signOut,
    setEditingNote,
  };

  if (!session?.user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.neutral[50],
        }}
      >
        <Text
          style={{
            color: theme.colors.error.light,
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.medium,
          }}
        >
          {t('common.pleaseSignIn')}
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name='MainTabs' options={{ headerShown: false }}>
        {() => <TabNavigator screenProps={screenProps} />}
      </Stack.Screen>
      <Stack.Screen
        name='CreateNoteModal'
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      >
        {({ route, navigation }) => (
          <CreateNoteScreen
            handleSubmit={handleSubmit}
            onCancel={() => {
              navigation.goBack();
              setEditingNote(null);
            }}
            initialContent={editingNote?.content}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name='Conversation'
        options={{
          headerShown: true,
          headerTitle: t('common.conversation'),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.colors.neutral[50],
          },
          headerTitleStyle: {
            color: theme.colors.neutral[800],
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
          },
        }}
      >
        {({ route }) => <ConversationScreen route={route} />}
      </Stack.Screen>
      <Stack.Screen
        name='NotesListModal'
        options={{
          presentation: 'modal',
          headerShown: false,
          headerShadowVisible: false,
        }}
      >
        {() => (
          <NotesListScreen
            notes={screenProps.notes}
            onEdit={screenProps.handleEdit}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
