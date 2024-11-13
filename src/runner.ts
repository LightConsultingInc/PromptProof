import glob from 'glob';
import path from 'path';
import chalk from 'chalk';
import { LLMEvaluator } from './evaluator/core';
import { EvaluationConfig } from './types';

export interface RunnerConfig extends EvaluationConfig {
  pattern?: string;
  watch?: boolean;
}

export async function runTests(config: RunnerConfig): Promise<void> {
  const pattern = config.pattern || '**/*.test.ts';
  
  const files = glob.sync(pattern, {
    ignore: ['node_modules/**']
  });

  let passed = 0;
  let failed = 0;

  console.log(chalk.blue('Starting tests...\n'));

  const evaluator = new LLMEvaluator(config);

  for (const file of files) {
    try {
      const testModule = require(path.resolve(file));
      const testCases = testModule.default || testModule.testCases;

      if (!testCases || !Array.isArray(testCases)) {
        console.warn(chalk.yellow(`No test cases found in ${file}`));
        continue;
      }

      for (const testCase of testCases) {
        const result = await evaluator.evaluateTestCase(testCase);
        
        if (result.score >= (config.similarityThreshold || 0.8)) {
          passed++;
          console.log(chalk.green(`✓ ${file} - ${testCase.input}`));
        } else {
          failed++;
          console.log(chalk.red(`✗ ${file} - ${testCase.input}`));
          console.log(chalk.red(`Feedback: ${result.feedback}`));
        }
      }
    } catch (error) {
      failed++;
      console.log(chalk.red(`✗ ${file}`));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    }
  }

  console.log(`\nResults: ${chalk.green(passed)} passed, ${chalk.red(failed)} failed`);

  if (config.watch) {
    // Watch for changes and rerun tests
    const chokidar = require('chokidar');
    const watcher = chokidar.watch(pattern, {
      ignored: ['node_modules/**'],
      persistent: true
    });

    watcher.on('change', (path: string) => {
      console.log(chalk.blue(`\nFile ${path} changed. Rerunning tests...`));
      runTests(config);
    });
  }
} 