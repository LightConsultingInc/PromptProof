import { describe, llmTest } from '../test-utils/setup';

describe('Mathematical Problem Solving', () => {
  llmTest('should solve basic arithmetic', {
    input: 'What is 235 + 467?',
    expectedOutput: 'The sum of 235 and 467 is 702.',
    metadata: {
      category: 'math',
      difficulty: 'easy',
      requiredElements: ['correct calculation', 'clear explanation']
    }
  });

  llmTest('should explain algebraic concepts', {
    input: 'Explain how to solve the equation 2x + 5 = 13',
    expectedOutput: 'To solve 2x + 5 = 13, subtract 5 from both sides to get 2x = 8, then divide both sides by 2 to get x = 4. This means when you substitute x = 4 back into the original equation, it balances: 2(4) + 5 = 13.',
    metadata: {
      category: 'math',
      difficulty: 'medium',
      requiredElements: ['step-by-step explanation', 'final answer', 'verification']
    }
  });
}); 