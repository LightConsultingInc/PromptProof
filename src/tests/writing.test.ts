import { describe, llmTest } from '../test-utils/setup';

describe('Creative Writing and Analysis', () => {
  llmTest('should write a short story with given elements', {
    input: 'Write a short story (max 100 words) about a lost key that includes a surprise ending.',
    expectedOutput: 'Sarah searched frantically for her grandmother\'s antique key, retracing her steps through the house. After hours of searching, she finally called a locksmith to replace the old chest\'s lock. When he opened it, inside they found another identical key with a note: "My dear, sometimes we need to lose something to find its twin. Love, Grandma." Sarah smiled, remembering her grandmother\'s love for puzzles and life lessons.',
    metadata: {
      category: 'writing',
      difficulty: 'hard',
      requiredElements: ['character', 'conflict', 'resolution', 'surprise ending']
    }
  });

  llmTest('should analyze a poem', {
    input: `Analyze the meaning and literary devices in this poem:
    "Two roads diverged in a wood, and I—
    I took the one less traveled by,
    And that has made all the difference."`,
    expectedOutput: 'This excerpt from Robert Frost\'s "The Road Not Taken" uses the metaphor of a forked path to represent life choices. The speaker chooses the less conventional path, symbolized by "the one less traveled by." The repetition of "I" emphasizes the personal nature of the decision. The final line suggests that this choice was significant in shaping the speaker\'s life. The poem explores themes of individuality, choice, and the impact of decisions.',
    metadata: {
      category: 'writing',
      subcategory: 'analysis',
      difficulty: 'hard',
      requiredElements: ['metaphor analysis', 'theme identification', 'literary devices']
    }
  });
}); 