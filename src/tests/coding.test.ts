import { describe, llmTest } from '../test-utils/setup';

describe('Programming and Problem Solving', () => {
  llmTest('should explain Big O notation', {
    input: 'Explain Big O notation and give examples of O(1), O(n), and O(n²) algorithms.',
    expectedOutput: `Big O notation describes an algorithm's performance or complexity. Examples:
- O(1): Constant time, like accessing an array element by index
- O(n): Linear time, like finding an element in an unsorted array
- O(n²): Quadratic time, like basic bubble sort
Each notation represents how the algorithm's time grows with input size.`,
    metadata: {
      category: 'programming',
      subcategory: 'computer science',
      difficulty: 'medium',
      requiredConcepts: ['time complexity', 'algorithm analysis', 'performance scaling']
    }
  });

  llmTest('should write a recursive function', {
    input: 'Write a recursive function to calculate the nth Fibonacci number in Python. Include comments explaining how it works.',
    expectedOutput: `def fibonacci(n):
    # Base cases: fib(0) = 0, fib(1) = 1
    if n <= 1:
        return n
    
    # Recursive case: fib(n) = fib(n-1) + fib(n-2)
    return fibonacci(n-1) + fibonacci(n-2)`,
    metadata: {
      category: 'programming',
      subcategory: 'algorithms',
      difficulty: 'medium',
      requiredElements: ['recursion', 'base case', 'comments', 'proper syntax']
    }
  });
}); 