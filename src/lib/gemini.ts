import { GoogleGenAI } from '@google/genai';

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'placeholder',
});

export async function generateSummary(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: `Summarize the following article in a concise paragraph. Focus on the main takeaways.\n\n${text}`,
  });
  return response.text || 'No summary generated.';
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: { outputDimensionality: 768 }
  });
  return response.embeddings?.[0]?.values || [];
}
