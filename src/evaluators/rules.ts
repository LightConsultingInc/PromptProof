import { Evaluator, EvaluationResult } from './base';

export type Rule = {
  name: string;
  validate: (text: string) => boolean | Promise<boolean>;
  message: string;
};

export class RuleEvaluator extends Evaluator {
  private rules: Rule[];

  constructor(rules: Rule[], threshold = 1) { // Default threshold 1 means all rules must pass
    super(threshold);
    this.rules = rules;
  }

  async evaluate(actual: string): Promise<EvaluationResult> {
    const results = await Promise.all(
      this.rules.map(async rule => ({
        name: rule.name,
        passed: await rule.validate(actual),
        message: rule.message
      }))
    );

    const passedCount = results.filter(r => r.passed).length;
    const score = passedCount / this.rules.length;
    const failures = results.filter(r => !r.passed);

    return {
      passed: score >= this.threshold,
      score,
      feedback: failures.length > 0 
        ? `Failed rules: ${failures.map(f => f.name).join(', ')}`
        : 'All rules passed',
      details: { ruleResults: results }
    };
  }
} 