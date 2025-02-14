import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';

// Cache for welcome message
type WelcomeMessageCache = {
  message: string;
  timestamp: number;
  userName: string;
};

let welcomeMessageCache: WelcomeMessageCache | null = null;

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

    return result.response
      .text()
      .split('\n')
      .filter(topic => topic.trim())
      .slice(0, 3);
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
    welcomeMessageCache = {
      message,
      timestamp: today,
      userName,
    };

    return message;
  } catch (error) {
    console.error('Error getting welcome message:', error);
    const fallbackMessage = `Hi ${userName}, I hope you're having a good day today`;

    // Cache even fallback messages to prevent repeated API calls on error
    welcomeMessageCache = {
      message: fallbackMessage,
      timestamp: today,
      userName,
    };

    return fallbackMessage;
  }
}
