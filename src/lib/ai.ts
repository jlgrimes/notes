import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';
const WELCOME_CACHE_KEY = '@notes_app_welcome_cache';
const SUGGESTIONS_CACHE_KEY = '@notes_app_suggestions_cache';

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

export async function getCommonTopics(notes: any[]): Promise<string[]> {
  // Create a sorted list of note IDs to use as cache key
  const noteIds = notes.map(note => note.id).sort();
  console.log('New note IDs:', noteIds);

  // Check if we have a valid cache with the same notes
  const suggestionsCache = await getSuggestionsCache();
  if (suggestionsCache) {
    const cachedIds = [...suggestionsCache.noteIds].sort();
    console.log('Cached note IDs:', cachedIds);
    console.log('New IDs stringified:', JSON.stringify(noteIds));
    console.log('Cached IDs stringified:', JSON.stringify(cachedIds));
    if (JSON.stringify(cachedIds) === JSON.stringify(noteIds)) {
      console.log('Cache hit! Returning cached suggestions');
      return suggestionsCache.suggestions;
    }
    console.log("Cache miss - IDs don't match");
  } else {
    console.log('No cache exists yet');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const notesContent = notes
      .map(note => {
        const date = getRelativeDate(new Date(note.created_at));
        return `Time: ${date}\nContent: ${note.content}`;
      })
      .join('\n---\n');

    const result = await model.generateContent(`
      Here are your thoughts and reflections:
      ${notesContent}

      Create 3 warm, personal suggestions to help recall these thoughts.
      
      Format examples (create new ones based on the content):
      - "Remember when you mentioned that project"
      - "Tell me about your recent ideas"
      - "Share your thoughts on design"

      Rules:
      1. Return exactly 3 suggestions
      2. Start with gentle verbs (remember, tell, share)
      3. Make them specific to the content shown
      4. Keep each under 6 words
      5. One per line, no bullets
      6. Use time references naturally
    `);

    const suggestions = result.response
      .text()
      .split('\n')
      .filter(topic => topic.trim())
      .slice(0, 3);

    // Update cache
    const newCache = {
      suggestions,
      noteIds: [...noteIds],
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
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const notesContext = notes
      .map(note => {
        const date = getRelativeDate(new Date(note.created_at));
        return `Time: ${date}\nContent: ${note.content}`;
      })
      .join('\n---\n');

    const result = await model.generateContent(`
      Here are your thoughts and reflections:
      ${notesContext}
      
      Question: ${query}
      
      Look carefully through the content and provide a warm, brief answer.
      Focus on finding relevant information, even if it's not an exact match.
      Use phrases like "you mentioned" or "you were thinking about".
      Keep it conversational and under 3 sentences.
      
      Only if you've thoroughly checked and found nothing related, say "I don't see anything about that yet".
    `);

    return result.response.text();
  } catch (error) {
    console.error('Error searching notes:', error);
    throw error;
  }
}

export async function getWelcomeMessage(userName: string): Promise<string> {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  // Return cached message if it's from today and for the same user
  const welcomeMessageCache = await getWelcomeCache();
  if (
    welcomeMessageCache &&
    welcomeMessageCache.timestamp === today &&
    welcomeMessageCache.userName === userName
  ) {
    return welcomeMessageCache.message;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const result = await model.generateContent(`
      Return a casual greeting for ${userName}. Should be:
      - A complete, natural sentence
      - Include their name
      - Mention having a good day or similar
      - Friendly but not overly formal
      - No exclamation marks
      
      Return only the message.
    `);

    const message = result.response.text().trim();

    // Update cache
    const newCache = {
      message,
      timestamp: today,
      userName,
    };
    await setWelcomeCache(newCache);

    return message;
  } catch (error) {
    console.error('Error getting welcome message:', error);
    const fallbackMessage = `Hi ${userName}, I hope you're having a good day today`;

    // Cache even fallback messages to prevent repeated API calls on error
    const newCache = {
      message: fallbackMessage,
      timestamp: today,
      userName,
    };
    await setWelcomeCache(newCache);

    return fallbackMessage;
  }
}
