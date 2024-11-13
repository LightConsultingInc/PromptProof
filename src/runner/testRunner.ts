import { LLMEvaluator } from '../evaluator/core';
import { EvaluationResult, TestCase } from '../types';
import chalk from 'chalk';

export class TestRunner {
  private evaluator: LLMEvaluator;
  private results: Map<string, EvaluationResult>;

  constructor(config: any) {
    this.evaluator = new LLMEvaluator(config);
    this.results = new Map();
  }

  async runTests(testCases: TestCase[]): Promise<Map<string, EvaluationResult>> {
    for (const testCase of testCases) {
      // Convert TestCase to the format expected by evaluator
      const evaluatorTest = {
        description: testCase.input, // Use input as description
        fn: async () => testCase.expectedOutput, // Return expectedOutput as the test result
        metadata: testCase.metadata
      };

      const result = await this.evaluator.evaluateTestCase(evaluatorTest);
      this.results.set(testCase.input, result);
    }

    return this.results;
  }

  generateReport(): string {
    let report = '\nTest Results:\n';
    let passed = 0;
    let failed = 0;

    this.results.forEach((result, input) => {
      if (result.score >= 0.8) {
        passed++;
        report += chalk.green(`✓ ${input}\n`);
      } else {
        failed++;
        report += chalk.red(`✗ ${input}\n`);
        report += chalk.red(`  Feedback: ${result.feedback}\n`);
      }
    });

    report += `\nSummary: ${chalk.green(passed)} passed, ${chalk.red(failed)} failed\n`;
    return report;
  }
} 