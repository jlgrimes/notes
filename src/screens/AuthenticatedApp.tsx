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
import type { ParamListBase } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

type RootStackParamList = {
  MainTabs: undefined;
  CreateNoteModal: { mode: 'create' };
  Conversation: {
    initialQuery: string;
    initialAnswer: string;
    onSuggestionPress: (suggestion: string) => void;
    previousAnswer: string;
  };
  NotesListModal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function ChatScreenWrapper(props: any) {
  return <ChatScreen {...props} mode='chat' />;
}

function TabNavigator({ screenProps }: any) {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'My Notes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          backgroundColor: '#FFFFFF',
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name='Chat'>
        {() => <ChatScreenWrapper {...screenProps} />}
      </Tab.Screen>
      <Tab.Screen
        name='Create'
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
                // @ts-ignore - navigation type is complex here
                navigation.navigate('CreateNoteModal', { mode: 'create' });
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#4F46E5',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <Icon name='add' size={32} color='#FFFFFF' />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      {/* <Tab.Screen name='My Notes'>
        {() => (
          <NotesListScreen
            notes={screenProps.notes}
            onEdit={screenProps.handleEdit}
            onDelete={screenProps.handleDelete}
          />
        )}
      </Tab.Screen> */}
      <Tab.Screen name='Settings'>
        {() => <SettingsScreen signOut={screenProps.signOut} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function AuthenticatedApp() {
  const { session, signOut } = useAuth();
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
      Alert.alert('Error', 'Please enter a search query.');
      return;
    }

    if (notes.length === 0) {
      setSearchResult("You haven't written any memos yet.");
      return;
    }

    try {
      setIsSearching(true);
      const result = await searchNotes(query, notes);
      setSearchQuery(query);
      setSearchResult(result);
    } catch (error) {
      console.error('Error searching memos:', error);
      Alert.alert('Error', 'Failed to search memos. Please try again.');
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
        Alert.alert('Error', 'Failed to fetch memos. Please try again.');
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error('Error in fetchNotes:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while fetching memos.'
      );
    }
  };

  const handleSubmit = async (note: { title: string; content: string }) => {
    try {
      if (!session?.user) {
        Alert.alert('Error', 'You must be signed in to create memos.');
        return;
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({ title: note.title, content: note.content })
          .eq('id', editingNote.id)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error updating memo:', error);
          Alert.alert('Error', 'Failed to update memo. Please try again.');
          return;
        }

        setEditingNote(null);
      } else {
        const { error } = await supabase.from('notes').insert([
          {
            title: note.title,
            content: note.content,
            user_id: session.user.id,
          },
        ]);

        if (error) {
          console.error('Error creating memo:', error);
          Alert.alert('Error', 'Failed to create memo. Please try again.');
          return;
        }
      }

      fetchNotes();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while saving the memo.'
      );
    }
  };

  const handleEdit = (id: string) => {
    const note = notes.find(n => n.id === id);
    setEditingNote(note);
  };

  const handleDelete = async (id: string) => {
    try {
      if (!session?.user) {
        Alert.alert('Error', 'You must be signed in to delete memos.');
        return;
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting memo:', error);
        Alert.alert('Error', 'Failed to delete memo. Please try again.');
        return;
      }

      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error in handleDelete:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while deleting the memo.'
      );
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
    handleDelete,
    editingNote,
    signOut,
  };

  if (!session?.user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#EF4444', fontSize: 16 }}>
          Please sign in to view your memos.
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
        {({ navigation }) => (
          <CreateNoteScreen
            handleSubmit={handleSubmit}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name='Conversation'
        options={{
          headerShown: true,
          headerTitle: 'Conversation',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#f7f7f7',
          },
          headerTitleStyle: {
            color: '#1F2937',
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      >
        {({ route }) => <ConversationScreen route={route} />}
      </Stack.Screen>
      <Stack.Screen
        name='NotesListModal'
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'All Memos',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#f7f7f7',
          },
          headerTitleStyle: {
            color: '#1F2937',
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      >
        {() => (
          <NotesListScreen
            notes={screenProps.notes}
            onEdit={screenProps.handleEdit}
            onDelete={screenProps.handleDelete}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
