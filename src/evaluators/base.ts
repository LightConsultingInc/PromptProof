export interface BaseEvaluator {
  evaluate(actual: string, expected: string): Promise<EvaluationResult>;
}

export interface EvaluationResult {
  passed: boolean;
  score: number;
  feedback?: string;
  details?: Record<string, any>;
}

export abstract class Evaluator implements BaseEvaluator {
  protected threshold: number;
  
  constructor(threshold = 0.8) {
    this.threshold = threshold;
  }
  
  abstract evaluate(actual: string, expected: string): Promise<EvaluationResult>;
} 