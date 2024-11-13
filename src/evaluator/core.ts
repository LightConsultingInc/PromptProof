import { LangChainService } from '../langchain/langchain.service';
import { ModelConfig } from '../langchain/langchain.types';
import {
  EvaluationResult,
  TestCase,
  EvaluationConfig,
  EvaluationMetric
} from '../types';

interface TestFunction {
  (): Promise<string>;
}

export class LLMEvaluator {
  private config: EvaluationConfig;
  private modelService: LangChainService;
  private evaluatorService: LangChainService;

  constructor(config: EvaluationConfig) {
    this.config = config;
    
    // Initialize services with proper ModelConfig
    this.modelService = new LangChainService({
      provider: this.config.model.provider,
      model: this.config.model.name,
      temperature: this.config.model.parameters?.temperature,
      maxTokens: this.config.model.parameters?.maxTokens,
      apiKey: this.config.model.parameters?.apiKey as string,
    });
    
    this.evaluatorService = new LangChainService({
      provider: this.config.evaluator.model.provider,
      model: this.config.evaluator.model.name,
      temperature: this.config.evaluator.model.parameters?.temperature,
      maxTokens: this.config.evaluator.model.parameters?.maxTokens,
      apiKey: this.config.evaluator.model.parameters?.apiKey as string,
    });
  }

  async evaluateTestCase(test: { description: string; fn: TestFunction; metadata?: any }): Promise<EvaluationResult> {
    try {
      // Execute the test function and get the response string
      const response = await test.fn();
      
      // Get the actual output from the model being evaluated
      const actualOutput = await this.modelService.chat([
        { role: 'user', content: response }
      ]);
      
      // Run all metrics
      const metricResults = await Promise.all(
        this.config.metrics.map(async metric => {
          const score = await this.evaluateMetric(metric, actualOutput, response);
          const explanation = await this.generateExplanation(
            metric.name,
            score,
            actualOutput,
            response
          );
          return { metric: metric.name, score, explanation };
        })
      );

      // Run rule validations if configured
      const ruleViolations = this.config.rules 
        ? await this.validateRules(actualOutput)
        : [];

      // Get LLM evaluation
      const evaluation = await this.evaluateResponse(
        test.description,
        response,
        actualOutput
      );

      // Get overall summary
      const summary = await this.summarizeEvaluation(metricResults);

      return {
        score: evaluation.score,
        feedback: evaluation.feedback,
        issues: ruleViolations,
        metadata: {
          metricResults,
          actualOutput,
          reasoning: evaluation.reasoning,
          summary,
          timestamp: new Date().toISOString(),
          modelConfig: this.config.model,
          ...test.metadata
        }
      };
    } catch (error) {
      console.error('Error evaluating test case:', error);
      throw error;
    }
  }

  private async evaluateMetric(
    metric: EvaluationMetric,
    actual: string,
    expected: string
  ): Promise<number> {
    try {
      const score = await metric.evaluate(actual, expected);
      return score;
    } catch (error) {
      console.error(`Error evaluating metric ${metric.name}:`, error);
      return 0;
    }
  }

  private async validateRules(output: string): Promise<string[]> {
    if (!this.config.rules) return [];

    const violations = await Promise.all(
      this.config.rules.map(async (rule) => {
        const isValid = await this.validateRule(output, rule.message);
        return isValid ? null : rule.message;
      })
    );

    return violations.filter((v): v is string => v !== null);
  }

  private async validateRule(output: string, rule: string): Promise<boolean> {
    const response = await this.evaluatorService.chat([
      {
        role: 'system',
        content: 'You are a validation expert. Return only "true" or "false".'
      },
      {
        role: 'user',
        content: `Does this output follow the rule? Output: "${output}" Rule: "${rule}"`
      }
    ]);

    return response.toLowerCase().includes('true');
  }

  private async evaluateResponse(
    input: string,
    expectedOutput: string,
    actualOutput: string
  ): Promise<{ score: number; feedback: string; reasoning: string }> {
    const response = await this.evaluatorService.chat([
      {
        role: 'system',
        content: this.config.evaluator.systemPrompt || `Evaluate the response based on:
          1. Relevance to input
          2. Accuracy compared to expected output
          3. Completeness
          4. Clarity
          Provide JSON response with "score" (0-1), "feedback" (brief), and "reasoning" (detailed).`
      },
      {
        role: 'user',
        content: `Input: ${input}\nExpected: ${expectedOutput}\nActual: ${actualOutput}`
      }
    ]);

    try {
      return JSON.parse(response);
    } catch {
      return {
        score: 0,
        feedback: 'Failed to parse evaluation',
        reasoning: response
      };
    }
  }

  private async generateExplanation(
    metric: string,
    score: number,
    actual: string,
    expected: string
  ): Promise<string> {
    return this.evaluatorService.chat([
      {
        role: 'system',
        content: 'Explain why this metric score was given. Be specific and provide examples.'
      },
      {
        role: 'user',
        content: `Metric: ${metric}\nScore: ${score}\nActual: ${actual}\nExpected: ${expected}`
      }
    ]);
  }

  private async summarizeEvaluation(
    results: Array<{ metric: string; score: number; explanation: string }>
  ): Promise<string> {
    return this.evaluatorService.chat([
      {
        role: 'system',
        content: 'Create a concise summary of the evaluation results. Highlight key strengths and areas for improvement.'
      },
      {
        role: 'user',
        content: `Results:\n${results.map(r => 
          `${r.metric}: ${r.score}\n${r.explanation}`
        ).join('\n\n')}`
      }
    ]);
  }
} 