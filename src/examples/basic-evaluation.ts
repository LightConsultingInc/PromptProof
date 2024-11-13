import { TestRunner } from '../runner/testRunner';
import { 
  semanticSimilarityMetric, 
  bleuScoreMetric, 
  rougeScoreMetric 
} from '../metrics/semantic';
import { Providers, ProviderModels, AnthropicModels } from '../langchain/langchain.types';

async function main() {
  const config = {
    model: {
      name: AnthropicModels.CLAUDE_3_SONNET,
      provider: Providers.ANTHROPIC,
      parameters: {
        temperature: 0.7
      }
    },
    evaluator: {
      model: {
        name: AnthropicModels.CLAUDE_3_OPUS,
        provider: Providers.ANTHROPIC,
        parameters: {
          temperature: 0.2
        }
      },
      systemPrompt: `You are an expert at evaluating LLM outputs.
        Evaluate based on:
        1. Factual accuracy
        2. Relevance
        3. Completeness
        4. Clarity
        Provide specific examples and suggestions for improvement.`
    },
    metrics: [
      semanticSimilarityMetric,
      bleuScoreMetric,
      rougeScoreMetric
    ],
    similarityThreshold: 0.8
  };

  const testCases = [
    {
      input: "Explain how photosynthesis works",
      expectedOutput: "Photosynthesis is the process where plants convert sunlight into energy...",
      metadata: {
        category: 'science',
        difficulty: 'medium'
      }
    }
  ];

  const runner = new TestRunner(config);
  const results = await runner.runTests(testCases);
  console.log(runner.generateReport());
}

main().catch(console.error); 