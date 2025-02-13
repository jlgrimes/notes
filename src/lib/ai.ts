import { GoogleGenerativeAI } from '@google/generative-ai';

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
      model: 'gemini-2.0-flash',
    });

    // Format notes into a string
    const notesContent = notes
      .map(note => {
        const date = new Date(note.created_at).toLocaleDateString();
        return `Date: ${date}\nContent: ${note.content}`;
      })
      .join('\n---\n');

    const result = await model.generateContent(`
      Here are the user's thoughts and reflections:
      ${notesContent}

      Create 3 gentle, conversational suggestions that would help them recall their thoughts.
      Make each one feel warm and personal, as if continuing an ongoing conversation.
      
      Examples of the format (BUT DON'T USE THESE, CREATE NEW ONES BASED ON THE ACTUAL CONTENT):
      - "Remember when you mentioned that idea"
      - "Let's find what you were thinking"
      - "Tell me about your progress"

      Rules:
      1. Return exactly 3 suggestions (or fewer if there isn't enough content)
      2. Start each with a gentle verb like "remember", "tell", "share", "find"
      3. Make them SPECIFIC to the actual content shown
      4. Keep each suggestion under 6 words
      5. Return only the suggestions, one per line
      6. Don't include bullets or numbers
      7. Don't make up content that isn't present
      8. Use natural time references when relevant
      9. Avoid phrases like "from your notes" or "from your todos"
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
      model: 'gemini-2.0-flash',
    });

    // Format notes into a string for context
    const notesContext = notes
      .map(note => {
        const date = getRelativeDate(new Date(note.created_at));
        return `Time: ${date}\nThoughts: ${note.content}\n---`;
      })
      .join('\n');

    const result = await model.generateContent(`
      Context: Here are the user's thoughts and reflections:
      ${notesContext}
      
      Question: ${query}
      
      Provide a gentle, brief response that:
      1. Answers the question using the information provided
      2. Uses warm phrases like "you mentioned, when we talked about..." or "you were thinking about..."
      3. If nothing relevant exists, kindly say "I don't see anything about that yet"
      
      Keep the response concise but warm, using at most 2-3 sentences.
      Use natural pauses with commas to keep the tone conversational.
      Avoid phrases like "in your notes" or "in your todos".
    `);

    return result.response.text();
  } catch (error) {
    console.error('Error searching notes:', error);
    throw error;
  }
}
