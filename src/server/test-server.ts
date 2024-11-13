import express, { Express } from 'express';
import { Server } from 'socket.io';
import { globalTestStore } from '../test-utils/setup';
import { LLMEvaluator } from '../evaluator/core';
import { Providers, Models } from '../langchain/langchain.types';
import { semanticSimilarityMetric, bleuScoreMetric, rougeScoreMetric } from '../metrics/semantic';
import glob from 'glob';
import path from 'path';
import { register } from 'ts-node';
import { initializeEmbeddings } from '../utils/embeddings';

interface RunTestsRequest {
  provider: Providers;
  model: Models;
  apiKey: string;
}

// Register ts-node to handle TypeScript files
register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2018',
  },
});

export function setupTestRoutes(app: Express, io: Server) {
  // Load all test files
  function loadTests() {
    try {
      // Get the absolute path to the tests directory
      const testsDir = path.resolve(process.cwd(), 'src/tests');
      console.log('Looking for tests in:', testsDir);
      
      // Find all test files
      const testFiles = glob.sync('**/*.test.ts', {
        cwd: testsDir,
        absolute: true
      });
      
      console.log('Found test files:', testFiles);

      // Clear previous tests only if we found new ones
      if (testFiles.length > 0) {
        globalTestStore.clear();
        
        // Load each test file
        testFiles.forEach(file => {
          try {
            // Clear require cache to ensure fresh load
            delete require.cache[require.resolve(file)];
            // Use require with the original .ts file
            require(file);
          } catch (error) {
            console.error(`Error loading test file ${file}:`, error);
          }
        });
      }

      const tests = globalTestStore.getAllTests();
      console.log(`Successfully loaded ${tests.length} tests from ${testFiles.length} files`);
      return tests;
    } catch (error) {
      console.error('Error loading tests:', error);
      throw error;
    }
  }

  // Move test files from examples to src/tests if they don't exist
  function ensureTestFiles() {
    const testsDir = path.resolve(process.cwd(), 'src/tests');
    
    // Create tests directory if it doesn't exist
    if (!require('fs').existsSync(testsDir)) {
      console.log('Creating tests directory...');
      require('fs').mkdirSync(testsDir, { recursive: true });
    }

    const existingFiles = glob.sync('**/*.test.ts', { cwd: testsDir });
    if (existingFiles.length === 0) {
      console.log('No tests found in src/tests, copying example tests...');
      const testFiles = [
        'math.test.ts',
        'science.test.ts',
        'writing.test.ts',
        'coding.test.ts'
      ];

      testFiles.forEach(file => {
        const targetPath = path.resolve(testsDir, file);
        const sourcePath = path.resolve(__dirname, '../../src/tests', file);
        
        try {
          if (!require('fs').existsSync(targetPath)) {
            console.log(`Creating ${file}...`);
            // Copy the file content
            const content = require('fs').readFileSync(sourcePath, 'utf8');
            require('fs').writeFileSync(targetPath, content);
            console.log(`Created ${file} successfully`);
          }
        } catch (error) {
          console.error(`Error creating test file ${file}:`, error);
        }
      });
    }
  }

  // Call ensureTestFiles before setting up routes
  ensureTestFiles();

  // Add a helper function for parallel execution
  async function runTestsInParallel(tests: any[], evaluator: LLMEvaluator, batchSize: number = 3) {
    const results = [];
    for (let i = 0; i < tests.length; i += batchSize) {
      const batch = tests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async test => {
          try {
            console.log(`Running test: ${test.description}`);
            const result = await evaluator.evaluateTestCase(test);
            console.log(`Test completed: ${test.description}`);
            return {
              description: test.description,
              status: 'completed',
              ...result
            };
          } catch (error) {
            console.error(`Error running test: ${test.description}`, error);
            return {
              description: test.description,
              status: 'failed',
              score: 0,
              feedback: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              actualOutput: '',
              expectedOutput: test.expectedOutput,
              metadata: test.metadata
            };
          }
        })
      );
      results.push(...batchResults);
      
      // Emit each result in the batch
      batchResults.forEach(result => {
        io.emit('testResult', result);
      });
    }
    return results;
  }

  // Set up routes
  app.post('/api/run-tests', async (req, res) => {
    const { provider, model, apiKey } = req.body as RunTestsRequest;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    try {
      await initializeEmbeddings(apiKey);
    } catch (error) {
      console.error('Failed to initialize embeddings:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize embeddings'
      });
    }
    
    const config = {
      model: {
        name: model,
        provider,
        parameters: {
          temperature: 0.7,
          apiKey: apiKey
        }
      },
      evaluator: {
        model: {
          name: model,
          provider,
          parameters: {
            temperature: 0.2,
            apiKey: apiKey
          }
        }
      },
      metrics: [
        semanticSimilarityMetric,
        bleuScoreMetric,
        rougeScoreMetric
      ],
      similarityThreshold: 0.8
    };

    try {
      const evaluator = new LLMEvaluator(config);
      const tests = loadTests();
      console.log(`Loaded ${tests.length} tests`);
      
      // Run tests in parallel with batch size of 3
      const results = await runTestsInParallel(tests, evaluator, 3);
      
      res.json({ 
        success: true, 
        message: `Completed ${results.length} tests`,
        results 
      });
    } catch (error) {
      console.error('Error in test execution:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/tests', (req, res) => {
    try {
      const tests = loadTests();
      console.log('Sending available tests:', tests.length);
      res.json({
        success: true,
        tests: tests.map(test => ({
          description: test.description,
          metadata: test.metadata
        }))
      });
    } catch (error) {
      console.error('Error getting available tests:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Set up socket connection handler
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
} 