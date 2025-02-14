// Collection of all AI prompts used in the application

// Prompt for generating common topics/suggestions from notes
export const COMMON_TOPICS_PROMPT = `
Here are your thoughts and reflections:
\${notesContent}

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
`;

// Prompt for searching notes
export const SEARCH_NOTES_PROMPT = `
Here are your thoughts and reflections:
\${notesContext}

Question: \${query}

Look carefully through the content and provide a warm, brief answer.
Focus on finding relevant information, even if it's not an exact match.
Use phrases like "you mentioned" or "you were thinking about".
Keep it conversational and under 3 sentences.

Only if you've thoroughly checked and found nothing related, say "I don't see anything about that yet".
`;

// Prompt for generating welcome message
export const WELCOME_MESSAGE_PROMPT = `
Return a casual greeting for \${userName}. Should be:
- A complete, natural sentence
- Include their name
- Mention having a good day or similar
- Friendly but not overly formal
- No exclamation marks

Return only the message.
`;

// Prompt for generating smart suggestions based on previous answer
export const SMART_SUGGESTIONS_PROMPT = `
Here is my previous response:
"\${previousAnswer}"

Generate 3 follow-up questions that would naturally come next.
Each question should be written as a direct, factual question to an AI assistant.
Each should end with an appropriate emoji that matches the topic.

Consider questions about:
1. More specific details about what was explained
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
3. Write questions in a direct, factual way (no "you" or "your")
4. Each should explore a different aspect
5. One per line, no bullets or introductory text
6. Make them natural follow-up questions to the explanation
7. Choose emojis that match the specific topic
8. Do not include any text before or after the questions

Example output:
What were the key factors behind the Industrial Revolution? 🏭
How do modern steam engines differ from early designs? ⚙️
Which industries still use steam power today? 🔋
`;

// Prompt for generating follow-up answers
export const FOLLOW_UP_ANSWER_PROMPT = `
Previous context:
"\${previousAnswer}"

New question: "\${question}"

You are a knowledgeable AI assistant. Provide a detailed answer that builds upon the previous context.

Guidelines:
1. Use the previous answer as context to provide more depth
2. Add new, relevant information not covered before
3. Keep the tone conversational but informative
4. Aim for 2-3 sentences that provide meaningful insights
5. For any specific places mentioned in your answer:
   - Include ALL specific places in the LOCATIONS section, whether they're recommendations or just mentioned
   - If you mention a place by name (like "Dishoom" or "Central Park"), it MUST go in the LOCATIONS section
   - Include full details for each place mentioned, including its Google Place ID if you know it
6. If the question asks about places or recommendations:
   - You MUST include at least one specific place in your answer
   - Be specific with real places, not generic descriptions

Format your response EXACTLY as follows:
ANSWER: Your detailed answer here.
LOCATIONS: []

Examples of correct formatting:

Example 1 (when mentioning a place):
ANSWER: The concept is similar to what Dishoom does with their breakfast naan rolls, which have become incredibly popular in London.
LOCATIONS: [{
  "name": "Dishoom Shoreditch",
  "address": "7 Boundary Street, London E2 7JE, United Kingdom",
  "placeId": "ChIJZ2qV1b4cdkgRtCNON6x5F3g"
}]

Example 2 (when recommending places):
ANSWER: Pike Place Market in Seattle is a great spot to check out, and while you're in the area, you might also enjoy the nearby Seattle Art Museum.
LOCATIONS: [
  {
    "name": "Pike Place Market",
    "address": "85 Pike Street, Seattle, WA 98101",
    "placeId": "ChIJPcneb3JqkFQRqPqXpJHLN9s"
  },
  {
    "name": "Seattle Art Museum",
    "address": "1300 First Avenue, Seattle, WA 98101",
    "placeId": "ChIJ-bfVTLJqkFQRDZLQnmioK9s"
  }
]

Make sure:
1. The LOCATIONS array is always valid JSON
2. ANY specific place mentioned by name must be included in LOCATIONS
3. Use real, specific places with accurate addresses and Google Place IDs
4. If you don't know the exact Place ID, it's better to still include the place with just the name and approximate address
`;
