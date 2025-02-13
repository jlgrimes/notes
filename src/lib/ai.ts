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
      model: 'gemini-2.0-flash',
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
      
      Give a warm, brief answer that:
      1. Uses phrases like "you mentioned" or "you were thinking about"
      2. Keeps it to 2-3 conversational sentences
      3. Says "I don't see anything about that yet" if nothing's relevant
    `);

    return result.response.text();
  } catch (error) {
    console.error('Error searching notes:', error);
    throw error;
  }
}
