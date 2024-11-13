import { Evaluator, EvaluationResult } from './base';
import { getEmbeddings, cosineSimilarity } from '../utils/embeddings';
import { calculateBLEU } from '../utils/bleu';
import { calculateROUGE } from '../utils/rouge';

export class SemanticEvaluator extends Evaluator {
  private useEmbeddings: boolean;
  private useBLEU: boolean;
  private useROUGE: boolean;

  constructor(options: {
    threshold?: number;
    useEmbeddings?: boolean;
    useBLEU?: boolean;
    useROUGE?: boolean;
  } = {}) {
    super(options.threshold);
    this.useEmbeddings = options.useEmbeddings ?? true;
    this.useBLEU = options.useBLEU ?? true;
    this.useROUGE = options.useROUGE ?? true;
  }

  async evaluate(actual: string, expected: string): Promise<EvaluationResult> {
    const scores: { [key: string]: number } = {};
    
    if (this.useEmbeddings) {
      const [actualEmbed, expectedEmbed] = await Promise.all([
        getEmbeddings(actual),
        getEmbeddings(expected)
      ]);
      scores.semantic = cosineSimilarity(actualEmbed, expectedEmbed);
    }
    
    if (this.useBLEU) {
      scores.bleu = calculateBLEU(actual, expected);
    }
    
    if (this.useROUGE) {
      scores.rouge = calculateROUGE(actual, expected);
    }

    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    return {
      passed: avgScore >= this.threshold,
      score: avgScore,
      details: scores
    };
  }
} 