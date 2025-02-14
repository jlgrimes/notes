import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  COMMON_TOPICS_PROMPT,
  SEARCH_NOTES_PROMPT,
  WELCOME_MESSAGE_PROMPT,
  SMART_SUGGESTIONS_PROMPT,
  FOLLOW_UP_ANSWER_PROMPT,
} from './prompts';

const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';
const WELCOME_CACHE_KEY = '@memo_welcome_cache';
const SUGGESTIONS_CACHE_KEY = '@memo_suggestions_cache';
const SEARCH_CACHE_KEY = '@memo_search_cache';

// Cache for welcome message
type WelcomeMessageCache = {
  message: string;
  timestamp: number;
  userName: string;
};

// Cache for suggestions
type SuggestionsCache = {
  suggestions: string[];
  noteIds: string[];
  timestamp: number;
};

// Cache for search results
type SearchCacheEntry = {
  result: string;
  noteIds: string[];
  query: string;
  timestamp: number;
};

// Helper functions for cache management
async function getWelcomeCache(): Promise<WelcomeMessageCache | null> {
  try {
    const cache = await AsyncStorage.getItem(WELCOME_CACHE_KEY);
    return cache ? JSON.parse(cache) : null;
  } catch (error) {
    console.error('Error reading welcome cache:', error);
    return null;
  }
}

async function setWelcomeCache(cache: WelcomeMessageCache) {
  try {
    await AsyncStorage.setItem(WELCOME_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error setting welcome cache:', error);
  }
}

async function getSuggestionsCache(): Promise<SuggestionsCache | null> {
  try {
    const cache = await AsyncStorage.getItem(SUGGESTIONS_CACHE_KEY);
    return cache ? JSON.parse(cache) : null;
  } catch (error) {
    console.error('Error reading suggestions cache:', error);
    return null;
  }
}

async function setSuggestionsCache(cache: SuggestionsCache) {
  try {
    await AsyncStorage.setItem(SUGGESTIONS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error setting suggestions cache:', error);
  }
}

async function getSearchCache(): Promise<SearchCacheEntry[]> {
  try {
    const cache = await AsyncStorage.getItem(SEARCH_CACHE_KEY);
    if (!cache) return [];

    const parsed = JSON.parse(cache);
    // If it's the old format (single object) or invalid, clear it and return empty array
    if (!Array.isArray(parsed)) {
      await AsyncStorage.removeItem(SEARCH_CACHE_KEY);
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Error reading search cache:', error);
    return [];
  }
}

async function setSearchCache(newEntry: Omit<SearchCacheEntry, 'timestamp'>) {
  try {
    const currentCache = await getSearchCache();

    // Add timestamp to new entry
    const entryWithTimestamp: SearchCacheEntry = {
      ...newEntry,
      timestamp: Date.now(),
    };

    // Add new entry to the beginning and keep only the latest 10
    const updatedCache = [entryWithTimestamp, ...currentCache].slice(0, 10);

    await AsyncStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(updatedCache));
  } catch (error) {
    console.error('Error setting search cache:', error);
  }
}

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
);

function getRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 14) {
    return 'last week';
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else if (diffDays < 60) {
    return 'last month';
  } else {
    return `${Math.floor(diffDays / 30)} months ago`;
  }
}

export type AISuggestion = {
  title: string;
  content: string;
};

// Helper functions for cache management
function isFromCurrentDay(timestamp: number): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export async function getCommonTopics(notes: any[]): Promise<string[]> {
  try {
    // Create a sorted list of note IDs to use as cache key
    const noteIds = notes.map(note => note.id).sort();

    // Check if we have a valid cache with the same notes
    const suggestionsCache = await getSuggestionsCache();
    if (
      suggestionsCache?.timestamp &&
      isFromCurrentDay(suggestionsCache.timestamp)
    ) {
      const cachedIds = [...suggestionsCache.noteIds].sort();
      if (JSON.stringify(cachedIds) === JSON.stringify(noteIds)) {
        console.log('Cache hit! Returning cached suggestions');
        return suggestionsCache.suggestions;
      }
      console.log("Cache miss - IDs don't match");
    } else {
      console.log('Cache miss - not from current day');
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const notesContent = notes
      .map(note => {
        const date = getRelativeDate(new Date(note.created_at));
        return `Time: ${date}\nContent: ${note.content}`;
      })
      .join('\n---\n');

    const result = await model.generateContent(
      COMMON_TOPICS_PROMPT.replace('${notesContent}', notesContent)
    );

    const suggestions = result.response
      .text()
      .split('\n')
      .filter(topic => topic.trim())
      .slice(0, 3);

    // Update cache
    const newCache = {
      suggestions,
      noteIds,
      timestamp: Date.now(),
    };
    await setSuggestionsCache(newCache);
    console.log('Updated cache with new suggestions and IDs:', noteIds);

    return suggestions;
  } catch (error) {
    console.error('Error getting common topics:', error);
    return [];
  }
}

export async function searchNotes(
  query: string,
  notes: any[]
): Promise<string> {
  try {
    // Create a sorted list of note IDs to use as cache key
    const noteIds = notes.map(note => note.id).sort();

    // Check if we have a valid cache with the same notes and query
    const searchCache = await getSearchCache();
    const matchingCache = searchCache.find(
      entry =>
        entry.query === query &&
        JSON.stringify(entry.noteIds) === JSON.stringify(noteIds) &&
        isFromCurrentDay(entry.timestamp)
    );

    if (matchingCache) {
      console.log('Search cache hit! Returning cached result');
      return matchingCache.result;
    }
    console.log('Search cache miss - fetching new result');

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const notesContext = notes
      .map(note => {
        const date = getRelativeDate(new Date(note.created_at));
        return `Time: ${date}\nContent: ${note.content}`;
      })
      .join('\n---\n');

    const result = await model.generateContent(
      SEARCH_NOTES_PROMPT.replace('${notesContext}', notesContext).replace(
        '${query}',
        query
      )
    );

    const searchResult = result.response.text();

    // Update cache with new entry
    await setSearchCache({
      result: searchResult,
      noteIds,
      query,
    });
    console.log('Updated search cache with new result');

    return searchResult;
  } catch (error) {
    console.error('Error searching notes:', error);
    return 'Sorry, I encountered an error while searching your notes.';
  }
}

export async function getWelcomeMessage(userName: string): Promise<string> {
  try {
    // Return cached message if it's from the current day and for the same user
    const welcomeMessageCache = await getWelcomeCache();
    if (
      welcomeMessageCache &&
      isFromCurrentDay(welcomeMessageCache.timestamp) &&
      welcomeMessageCache.userName === userName
    ) {
      return welcomeMessageCache.message;
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const result = await model.generateContent(
      WELCOME_MESSAGE_PROMPT.replace('${userName}', userName)
    );

    const message = result.response.text().trim();

    // Update cache
    const newCache = {
      message,
      timestamp: Date.now(),
      userName,
    };
    await setWelcomeCache(newCache);

    return message;
  } catch (error) {
    console.error('Error getting welcome message:', error);
    return `Welcome back, ${userName}!`;
  }
}

export async function getSmartSuggestions(
  previousAnswer: string
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const result = await model.generateContent(
      SMART_SUGGESTIONS_PROMPT.replace('${previousAnswer}', previousAnswer)
    );

    const suggestions = result.response
      .text()
      .split('\n')
      .filter(suggestion => suggestion.trim())
      .slice(0, 3);

    return suggestions;
  } catch (error) {
    console.error('Error getting smart suggestions:', error);
    return [];
  }
}

interface LocationReference {
  name: string;
  address?: string;
  placeId?: string; // Google Places ID for accurate location linking
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AnswerWithLocations {
  answer: string;
  locations: LocationReference[];
}

export async function getFollowUpAnswer(
  question: string,
  previousAnswer: string
): Promise<AnswerWithLocations> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const result = await model.generateContent(
      FOLLOW_UP_ANSWER_PROMPT.replace(
        '${previousAnswer}',
        previousAnswer
      ).replace('${question}', question)
    );

    const response = result.response.text();
    let answer = '';
    let locations: LocationReference[] = [];

    // First, get the answer part
    const answerMatch = response.match(/ANSWER:(.*?)(?=LOCATIONS:|$)/s);
    if (answerMatch) {
      answer = answerMatch[1].trim();
    }

    // Then, try to get the locations part
    const locationsMatch = response.match(/LOCATIONS:(.*?)$/s);
    if (locationsMatch) {
      try {
        const locationsText = locationsMatch[1].trim();
        const parsedLocations = JSON.parse(locationsText);
        locations = Array.isArray(parsedLocations) ? parsedLocations : [];
      } catch (e) {
        console.error('Error parsing locations:', e);
        locations = [];
      }
    }

    return { answer, locations };
  } catch (error) {
    console.error('Error getting follow-up answer:', error);
    throw error;
  }
}
