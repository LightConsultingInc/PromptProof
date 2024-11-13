import { describe, llmTest } from '../test-utils/setup';

describe('Scientific Explanations', () => {
  llmTest('should explain DNA structure', {
    input: 'Describe the structure of DNA and its main components.',
    expectedOutput: 'DNA (deoxyribonucleic acid) has a double helix structure made of two strands. Each strand consists of nucleotides containing a sugar (deoxyribose), a phosphate group, and one of four bases: adenine (A), thymine (T), guanine (G), or cytosine (C). The bases pair specifically: A with T and G with C, held together by hydrogen bonds.',
    metadata: {
      category: 'science',
      subcategory: 'biology',
      difficulty: 'medium',
      requiredConcepts: ['double helix', 'nucleotides', 'base pairing']
    }
  });

  llmTest('should explain Newton\'s laws', {
    input: 'Explain Newton\'s three laws of motion.',
    expectedOutput: `1. First Law (Inertia): An object remains at rest or in uniform motion unless acted upon by an external force.
2. Second Law (F=ma): The force acting on an object equals its mass times acceleration.
3. Third Law: For every action, there is an equal and opposite reaction.`,
    metadata: {
      category: 'science',
      subcategory: 'physics',
      difficulty: 'medium',
      requiredConcepts: ['inertia', 'force', 'acceleration', 'action-reaction']
    }
  });
}); 