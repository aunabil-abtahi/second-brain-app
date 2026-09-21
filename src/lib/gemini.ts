import { GoogleGenAI } from '@google/genai';

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'placeholder',
});

export async function generateSummary(text: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Summarize the following article/content in a concise and insightful way:\n\n${text}`,
  });
  return response.text || '';
}

export async function generateEmbedding(text: string) {
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
  });
  if (!response.embeddings || !response.embeddings[0] || !response.embeddings[0].values) {
    throw new Error('Failed to generate embedding');
  }
  return response.embeddings[0].values;
}
