import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
);

export type AISuggestion = {
  title: string;
  content: string;
};

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
