import { describe, llmTest, expect } from '../src/index';
import { Providers, AnthropicModels } from '../src/index';

describe('Customer Service Tests', () => {
  llmTest('should handle refund request politely', async () => {
    const response = `I understand you'd like a refund for your headphones. 
      I'm sorry to hear they're broken. Please provide your order number 
      and I'll help you process the refund right away. Thank you for 
      bringing this to our attention.`;

    await expect(response)
      .toBeSimilarTo(`I understand you'd like a refund for your headphones...`)
      .semantic({ threshold: 0.7, useROUGE: true })
      .rules([
        {
          name: 'politeness',
          validate: text => 
            text.toLowerCase().includes('please') || 
            text.toLowerCase().includes('thank you'),
          message: 'Response must be polite'
        },
        {
          name: 'clarity',
          validate: text => text.split('.').length >= 2,
          message: 'Response must have multiple sentences for clarity'
        }
      ])
      .llm(
        Providers.ANTHROPIC,
        AnthropicModels.CLAUDE_3_OPUS,
        {
          systemPrompt: 'Evaluate customer service response quality'
        }
      )
      .evaluate();
  });
}); 