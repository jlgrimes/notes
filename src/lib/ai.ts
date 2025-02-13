import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
);

export type AISuggestion = {
  title: string;
  content: string;
};

export async function getCommonTopics(notes: any[]): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    // Format notes into a string with dates for better context
    const notesContent = notes
      .map(note => {
        const date = new Date(note.created_at).toLocaleDateString();
        return `Note from ${date}:\n${note.content}`;
      })
      .join('\n---\n');

    const result = await model.generateContent(`
      Here are the actual notes from the user's database:
      ${notesContent}

      Based ONLY on the content of these specific notes above, create 3 search suggestions that would help the user find information in THESE notes.
      Make each suggestion a natural, conversational phrase starting with a verb.
      
      Examples of the format (BUT DON'T USE THESE, USE THE ACTUAL CONTENT FROM THE NOTES):
      - "Check project deadlines"
      - "Review meeting notes from last week"
      - "Find updates about the marketing campaign"

      Rules:
      1. Return exactly 3 suggestions (or fewer if there aren't enough notes)
      2. Each suggestion should start with a verb
      3. Make them SPECIFIC to the actual content shown in the notes above
      4. Keep each suggestion under 6 words
      5. Return only the suggestions, one per line
      6. Don't include bullets or numbers
      7. Don't make up content that isn't in the notes
    `);

    return result.response
      .text()
      .split('\n')
      .filter(topic => topic.trim())
      .slice(0, 3); // Ensure we never return more than 3
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

    // Format notes into a string for context with dates
    const notesContext = notes
      .map(note => {
        const date = new Date(note.created_at).toLocaleDateString();
        return `Note from ${date}:\n${note.content}\n---`;
      })
      .join('\n');

    const result = await model.generateContent(`
      Context: Here are my notes:
      ${notesContext}
      
      Question: ${query}
      
      Provide a very brief response that:
      1. Answers the question using information from the notes
      2. If relevant, mentions when (which dates) the information is from
      3. If no relevant information exists, just say "No relevant information found"
      
      Keep the response as concise as possible, using at most 2-3 sentences.
    `);

    return result.response.text();
  } catch (error) {
    console.error('Error searching notes:', error);
    throw error;
  }
}
