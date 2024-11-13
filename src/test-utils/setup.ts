import { Providers, Models } from '../langchain/langchain.types';
import { TestCase } from '../types';
import { 
  SemanticEvaluator,
  LLMEvaluator,
  RuleEvaluator,
  CompositeEvaluator
} from '../evaluators/index';

export class LLMExpect {
  private evaluators: Array<{ evaluator: any; weight?: number }> = [];
  private threshold: number = 0.8;

  constructor(private actual: string, private expected: string) {}

  semantic(options?: { threshold?: number; useEmbeddings?: boolean; useBLEU?: boolean; useROUGE?: boolean }) {
    this.evaluators.push({
      evaluator: new SemanticEvaluator(options),
      weight: 2
    });
    return this;
  }

  llm(provider: Providers, model: Models, options?: { 
    systemPrompt?: string;
    temperature?: number;
    apiKey?: string;
  }) {
    this.evaluators.push({
      evaluator: new LLMEvaluator({
        provider,
        model,
        ...options
      }),
      weight: 1
    });
    return this;
  }

  rules(rules: Array<{
    name: string;
    validate: (text: string) => boolean | Promise<boolean>;
    message: string;
  }>) {
    this.evaluators.push({
      evaluator: new RuleEvaluator(rules),
      weight: 1
    });
    return this;
  }

  withThreshold(threshold: number) {
    this.threshold = threshold;
    return this;
  }

  async evaluate() {
    const evaluator = new CompositeEvaluator(this.evaluators, this.threshold);
    return evaluator.evaluate(this.actual, this.expected);
  }
}

export function expect(actual: string) {
  return {
    toBeSimilarTo: (expected: string) => new LLMExpect(actual, expected)
  };
}

export function describe(description: string, testFn: () => void) {
  console.log(`\n${description}`);
  testFn();
}

interface StoredTest {
  description: string;
  fn: () => Promise<void>;
  metadata?: Record<string, unknown>;
}

class TestStore {
  private tests: Map<string, StoredTest> = new Map();

  addTest(description: string, fn: () => Promise<void>, metadata?: Record<string, unknown>) {
    this.tests.set(description, { description, fn, metadata });
  }

  getAllTests() {
    return Array.from(this.tests.entries()).map(([description, test]) => ({
      description,
      fn: test.fn,
      metadata: test.metadata
    }));
  }

  clear() {
    this.tests.clear();
  }
}

export const globalTestStore = new TestStore();

export function llmTest(description: string, fn: () => Promise<void>, metadata?: Record<string, unknown>) {
  globalTestStore.addTest(description, fn, metadata);
} 