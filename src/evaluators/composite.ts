import { Evaluator, EvaluationResult } from './base';

export class CompositeEvaluator extends Evaluator {
  private evaluators: Array<{
    evaluator: Evaluator;
    weight?: number;
  }>;

  constructor(evaluators: Array<{ evaluator: Evaluator; weight?: number }>, threshold?: number) {
    super(threshold);
    this.evaluators = evaluators;
  }

  async evaluate(actual: string, expected: string): Promise<EvaluationResult> {
    const results = await Promise.all(
      this.evaluators.map(async ({ evaluator, weight = 1 }) => ({
        result: await evaluator.evaluate(actual, expected),
        weight
      }))
    );

    const totalWeight = results.reduce((sum, { weight }) => sum + weight, 0);
    const weightedScore = results.reduce(
      (sum, { result, weight }) => sum + (result.score * weight),
      0
    ) / totalWeight;

    return {
      passed: weightedScore >= this.threshold,
      score: weightedScore,
      feedback: results.map(r => r.result.feedback).filter(Boolean).join('\n'),
      details: {
        individualResults: results.map(r => r.result)
      }
    };
  }
} 