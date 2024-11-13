import { describe, llmTest, expect } from '../src/index';
import { Providers, AnthropicModels } from '../src/index';

describe('Math Tests', () => {
  llmTest('should solve basic arithmetic', async () => {
    const response = "The sum of 235 and 467 is 702.";
    
    await expect(response)
      .toBeSimilarTo('The sum of 235 and 467 is 702.')
      .semantic({ threshold: 0.8, useBLEU: true })
      .rules([
        {
          name: 'calculation',
          validate: text => /\d+\s*=\s*\d+/.test(text),
          message: 'Must include numerical calculation'
        }
      ])
      .llm(
        Providers.ANTHROPIC,
        AnthropicModels.CLAUDE_3_OPUS,
        {
          systemPrompt: 'Evaluate mathematical accuracy and clarity'
        }
      )
      .withThreshold(0.8)
      .evaluate();
  });
}); 