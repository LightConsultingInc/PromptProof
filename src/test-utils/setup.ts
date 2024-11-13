import { Providers, Models } from '../langchain/langchain.types';

export interface TestConfig {
  input: string;
  expectedOutput: string;
  metadata?: Record<string, unknown>;
}

export function describe(description: string, testFn: () => void) {
  console.log(`\n${description}`);
  testFn();
}

export function llmTest(description: string, testConfig: TestConfig) {
  // Store test case for later execution
  globalTestStore.addTest(description, testConfig);
}

// Global store for collecting tests
class TestStore {
  private tests: Map<string, TestConfig> = new Map();

  addTest(description: string, config: TestConfig) {
    this.tests.set(description, config);
  }

  getAllTests() {
    return Array.from(this.tests.entries()).map(([description, config]) => ({
      description,
      ...config,
    }));
  }

  clear() {
    this.tests.clear();
  }
}

export const globalTestStore = new TestStore(); 