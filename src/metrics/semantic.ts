import { EvaluationMetric } from '../types';
import { calculateBLEU } from '../utils/bleu';
import { calculateROUGE } from '../utils/rouge';
import { getEmbeddings, cosineSimilarity } from '../utils/embeddings';

export const semanticSimilarityMetric: EvaluationMetric = {
  name: 'semantic_similarity',
  async evaluate(actual: string, expected: string): Promise<number> {
    const [actualEmbedding, expectedEmbedding] = await Promise.all([
      getEmbeddings(actual),
      getEmbeddings(expected)
    ]);
    
    return cosineSimilarity(actualEmbedding, expectedEmbedding);
  },
  threshold: 0.85
};

export const bleuScoreMetric: EvaluationMetric = {
  name: 'bleu_score',
  evaluate: async (actual: string, expected: string): Promise<number> => {
    return calculateBLEU(actual, expected);
  },
  threshold: 0.7
};

export const rougeScoreMetric: EvaluationMetric = {
  name: 'rouge_score',
  evaluate: async (actual: string, expected: string): Promise<number> => {
    return calculateROUGE(actual, expected);
  },
  threshold: 0.6
}; 