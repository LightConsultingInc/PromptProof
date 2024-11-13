import { Evaluator, EvaluationResult } from './base';
import { LangChainService } from '../langchain/langchain.service';
import { ModelConfig } from '../langchain/langchain.types';

export class LLMEvaluator extends Evaluator {
  private llm: LangChainService;
  private systemPrompt: string;

  constructor(
    modelConfig: ModelConfig,
    options: {
      threshold?: number;
      systemPrompt?: string;
    } = {}
  ) {
    super(options.threshold);
    this.llm = new LangChainService(modelConfig);
    this.systemPrompt = options.systemPrompt || `
      Evaluate the response based on accuracy and completeness.
      Return a JSON object with:
      {
        "score": <number between 0 and 1>,
        "feedback": "<brief evaluation>",
        "reasoning": "<detailed explanation>"
      }
    `;
  }

  async evaluate(actual: string, expected: string): Promise<EvaluationResult> {
    const response = await this.llm.chat([
      { role: 'system', content: this.systemPrompt },
      { 
        role: 'user',
        content: `Expected: ${expected}\nActual: ${actual}`
      }
    ]);

    try {
      const result = JSON.parse(response);
      return {
        passed: result.score >= this.threshold,
        score: result.score,
        feedback: result.feedback,
        details: { reasoning: result.reasoning }
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        feedback: 'Failed to parse LLM evaluation',
        details: { raw: response }
      };
    }
  }
} 