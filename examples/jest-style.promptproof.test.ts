import { describe, llmTest, expect } from '../src/index';

describe('Math Tests', () => {
  llmTest('should solve basic arithmetic', async () => {
    const response = "The sum of 235 and 467 is 702.";
    
    await expect(response)
      .toBeSimilarTo('The sum of 235 and 467 is 702.')
      .semantic()
      .rules([
        {
          name: 'calculation',
          validate: text => /\d+\s*=\s*\d+/.test(text),
          message: 'Must include numerical calculation'
        }
      ])
      .evaluate();
      
    return response;
  });

  llmTest('should explain algebraic concepts', async () => {
    const response = `To solve 2x + 5 = 13:
1. Subtract 5 from both sides: 2x = 8
2. Divide both sides by 2: x = 4
3. Verify: 2(4) + 5 = 13 ✓
Therefore, x = 4 is the solution.`;

    await expect(response)
      .toBeSimilarTo(`To solve 2x + 5 = 13...`)
      .semantic()
      .rules([
        {
          name: 'steps',
          validate: text => text.includes('1.') && text.includes('2.'),
          message: 'Must include numbered steps'
        },
        {
          name: 'verification',
          validate: text => text.toLowerCase().includes('verify') || text.includes('✓'),
          message: 'Must include solution verification'
        }
      ])
      .evaluate();

    return response;
  });
}); 