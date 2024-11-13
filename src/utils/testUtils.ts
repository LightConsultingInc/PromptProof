class TestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestError';
  }
}

type TestFunction = () => void | Promise<void>;

const describe = (description: string, fn: TestFunction): void => {
  console.log(`\n${description}`);
  fn();
};

const test = (description: string, fn: TestFunction): void => {
  try {
    fn();
    console.log(`  ✓ ${description}`);
  } catch (error) {
    console.log(`  ✗ ${description}`);
    throw error;
  }
};

interface Expectation<T> {
  toBe: (expected: T) => void;
  toEqual: (expected: T) => void;
}

const expect = <T>(actual: T): Expectation<T> => ({
  toBe: (expected: T): void => {
    if (actual !== expected) {
      throw new TestError(`Expected ${expected} but received ${actual}`);
    }
  },
  toEqual: (expected: T): void => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new TestError(`Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`);
    }
  }
});

export {
  describe,
  test,
  expect,
  TestError,
  TestFunction,
  Expectation
}; 