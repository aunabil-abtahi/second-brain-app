import { GoogleGenAI } from '@google/genai';

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'placeholder',
});

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelayMs = 1000): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      console.warn(`Attempt ${attempt} failed, retrying in ${initialDelayMs * Math.pow(2, attempt - 1)}ms... Error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, initialDelayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Unreachable");
}

export async function generateSummary(text: string): Promise<string> {
  const response = await withRetry(() => ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: `Summarize the following article in a concise paragraph. Focus on the main takeaways.\n\n${text}`,
  }));
  return response.text || 'No summary generated.';
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await withRetry(() => ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: { outputDimensionality: 768 }
  }));
  return response.embeddings?.[0]?.values || [];
}
