import { TestCase, EvaluationConfig, EvaluationResult } from '../types';
import { LLMEvaluator } from '../evaluator/core';

export class TestRunner {
  private evaluator: LLMEvaluator;
  private results: Map<string, EvaluationResult> = new Map();

  constructor(config: EvaluationConfig) {
    this.evaluator = new LLMEvaluator(config);
  }

  async runTests(testCases: TestCase[]): Promise<Map<string, EvaluationResult>> {
    for (const testCase of testCases) {
      const result = await this.evaluator.evaluateTestCase(testCase);
      this.results.set(testCase.input, result);
    }

    return this.results;
  }

  generateReport(): string {
    let report = 'LLM Evaluation Report\n==================\n\n';
    
    let totalScore = 0;
    let passedTests = 0;

    this.results.forEach((result, input) => {
      report += `Test Case: ${input}\n`;
      report += `Score: ${result.score}\n`;
      report += `Feedback: ${result.feedback}\n`;
      
      if (result.issues?.length) {
        report += 'Issues:\n';
        result.issues.forEach(issue => {
          report += `- ${issue}\n`;
        });
      }
      
      report += '\n---\n\n';

      totalScore += result.score;
      if (result.score >= 0.8) passedTests++;
    });

    const averageScore = totalScore / this.results.size;
    report += `Summary:\n`;
    report += `Total Tests: ${this.results.size}\n`;
    report += `Passed Tests: ${passedTests}\n`;
    report += `Average Score: ${averageScore.toFixed(2)}\n`;

    return report;
  }
} 