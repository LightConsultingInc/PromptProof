import OpenAI from 'openai';

let openaiClient: OpenAI;

export async function initializeEmbeddings(apiKey: string): Promise<void> {
  openaiClient = new OpenAI({ apiKey });
}

export async function getEmbeddings(text: string): Promise<number[]> {
  if (!openaiClient) {
    throw new Error('Embeddings not initialized. Call initializeEmbeddings first.');
  }

  try {
    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error getting embeddings:', error);
    throw error;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
} 