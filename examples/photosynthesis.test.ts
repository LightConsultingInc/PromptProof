import { describe, llmTest } from '../test-utils/setup';

describe('Photosynthesis Explanations', () => {
  llmTest('should explain photosynthesis accurately', {
    input: 'Explain how photosynthesis works',
    expectedOutput: 'Photosynthesis is the process where plants convert sunlight into energy...',
    metadata: {
      category: 'science',
      difficulty: 'medium',
      requiredElements: ['sunlight', 'chlorophyll', 'carbon dioxide', 'water']
    }
  });

  llmTest('should explain the role of chlorophyll', {
    input: 'What is the role of chlorophyll in photosynthesis?',
    expectedOutput: 'Chlorophyll is the green pigment that absorbs sunlight...',
    metadata: {
      category: 'science',
      difficulty: 'medium',
      requiredConcepts: ['light absorption', 'pigment', 'energy conversion']
    }
  });
}); 