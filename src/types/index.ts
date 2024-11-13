import { Providers, Models } from '../langchain/langchain.types';
import { Evaluator } from '../evaluators/base';

export interface EvaluationResult {
  score: number;
  feedback: string;
  issues?: string[];
  metadata?: {
    metricResults: Array<{
      metric: string;
      score: number;
      explanation: string;
    }>;
    actualOutput: string;
    reasoning: string;
    summary: string;
    timestamp: string;
    modelConfig: EvaluatorModel;
  };
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  evaluator?: Evaluator;
  metadata?: Record<string, unknown>;
}

export interface EvaluationMetric {
  name: string;
  evaluate: (actual: string, expected: string) => Promise<number>;
  threshold?: number;
}

export interface RuleValidator {
  name: string;
  validate: (output: string) => Promise<boolean>;
  message: string;
}

export interface EvaluatorModel {
  name: Models;
  provider: Providers;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    [key: string]: unknown;
  };
}

export interface EvaluationConfig {
  evaluator: {
    model: EvaluatorModel;
    systemPrompt?: string;
  };
  model: EvaluatorModel;
  metrics: EvaluationMetric[];
  rules?: RuleValidator[];
  similarityThreshold?: number;
} 