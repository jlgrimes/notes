import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';
const WELCOME_CACHE_KEY = '@notes_app_welcome_cache';
const SUGGESTIONS_CACHE_KEY = '@notes_app_suggestions_cache';
const SEARCH_CACHE_KEY = '@notes_app_search_cache';

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
      Each suggestion should end with an appropriate emoji that matches the topic.
      
      Format examples (create new ones based on the content):
      - "Remember when you mentioned that project 💡"
      - "Tell me about your recent ideas 🤔"
      - "Share your thoughts on design 🎨"

      Rules:
      1. Return exactly 3 suggestions
      2. End with an emoji (space before emoji)
      3. Make them highly specific to the content shown
      4. Keep each under 6 words (excluding emoji)
      5. One per line, no bullets
      6. Use time references naturally
      7. Choose emojis that perfectly match the topic
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
  // Create a sorted list of note IDs to use as cache key
  const noteIds = notes.map(note => note.id).sort();
  console.log('Search - New note IDs:', noteIds);
  console.log('Search query:', query);

  // Check if we have a valid cache with the same notes and query
  const searchCache = await getSearchCache();
  const matchingCache = searchCache.find(
    entry =>
      entry.query === query &&
      JSON.stringify([...entry.noteIds].sort()) === JSON.stringify(noteIds)
  );

  if (matchingCache) {
    console.log('Search cache hit! Returning cached result');
    return matchingCache.result;
  }
  console.log('Search cache miss - fetching new result');

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

    const searchResult = result.response.text();

    // Update cache with new entry
    await setSearchCache({
      result: searchResult,
      noteIds: [...noteIds],
      query,
    });
    console.log('Updated search cache with new result');

    return searchResult;
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

export async function getSmartSuggestions(
  previousAnswer: string
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const result = await model.generateContent(`
      Here is my previous response to the user:
      "${previousAnswer}"

      Generate 3 follow-up questions that a curious user might ask me next.
      Each question should be written from the user's perspective, as if they are asking me directly.
      Each should end with an appropriate emoji that matches the topic.
      
      Consider questions about:
      1. More specific details about what was just explained
      2. How something works or why it happens
      3. Real examples or applications
      4. Comparisons or differences
      5. Historical background
      6. Latest developments
      7. Common challenges or solutions
      8. Expert insights or research
      
      Rules:
      1. Return exactly 3 questions
      2. End each question with a space and an emoji
      3. Write questions as if the user is asking me directly
      4. Each should explore a different aspect
      5. One per line, no bullets or introductory text
      6. Make them natural follow-up questions to my explanation
      7. Choose emojis that match the specific topic
      8. Do not include any text before or after the questions
      
      Return only the 3 questions, one per line, nothing else.
      
      Example output:
      Can you tell me more about the history of London Bridge? 🌍
      What makes the West End theatre district so special? 🎭
      Why did they build the Tower of London there? 🏰
    `);

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

export async function getFollowUpAnswer(
  question: string,
  previousAnswer: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const result = await model.generateContent(`
      Previous context:
      "${previousAnswer}"

      New question: "${question}"

      You are a knowledgeable AI assistant. Provide a detailed answer that builds upon the previous context.
      
      Guidelines:
      1. Use the previous answer as context to provide more depth
      2. Add new, relevant information not covered in the previous answer
      3. Consider current research, expert opinions, and real-world examples
      4. Keep the tone conversational but informative
      5. Aim for 2-3 sentences that provide meaningful insights
      6. Make connections between ideas where relevant
      
      Return only the answer, written in a natural, flowing style.
    `);

    return result.response.text();
  } catch (error) {
    console.error('Error getting follow-up answer:', error);
    throw error;
  }
}
