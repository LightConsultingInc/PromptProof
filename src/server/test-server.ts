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
import cors from 'cors';
import { setGlobalSettings } from '../test-utils/setup';

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
  // Ensure middleware is set up
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Load all test files
  function loadTests() {
    try {
      // Get the project root directory
      const projectRoot = process.cwd();
      console.log('Looking for tests in project root:', projectRoot);
      
      // Find all test files in the entire project
      const testFiles = glob.sync('**/*.promptproof.test.{ts,js}', {
        cwd: projectRoot,
        absolute: true,
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/coverage/**',
          '**/.git/**'
        ]
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
            // Use require with the original file
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

  // Add a helper function for parallel execution
  async function runTestsInParallel(tests: any[], evaluator: LLMEvaluator, batchSize: number = 3, io: Server) {
    const results = [];
    const startTime = Date.now();

    // Initialize all tests as pending
    tests.forEach(test => {
      io.emit('testResult', {
        description: test.description,
        status: 'pending',
        score: 0,
        feedback: 'Waiting to start...',
        startTime,
        metadata: test.metadata
      });
    });

    for (let i = 0; i < tests.length; i += batchSize) {
      const batch = tests.slice(i, i + batchSize);
      const batchPromises = batch.map(async test => {
        try {
          // Update status to running
          io.emit('testResult', {
            description: test.description,
            status: 'running',
            score: 0,
            feedback: 'Test in progress...',
            startTime: Date.now(),
            metadata: test.metadata
          });

          console.log(`Running test: ${test.description}`);
          await test.fn();
          const result = await evaluator.evaluateTestCase(test);
          const endTime = Date.now();

          const finalResult = {
            description: test.description,
            status: 'completed',
            startTime,
            endTime,
            ...result
          };

          // Emit individual test completion
          io.emit('testResult', finalResult);
          console.log(`Test completed: ${test.description}`);
          return finalResult;

        } catch (error) {
          console.error(`Error running test: ${test.description}`, error);
          const failedResult = {
            description: test.description,
            status: 'failed',
            score: 0,
            feedback: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            actualOutput: '',
            expectedOutput: '',
            startTime,
            endTime: Date.now(),
            metadata: test.metadata
          };
          
          // Emit test failure
          io.emit('testResult', failedResult);
          return failedResult;
        }
      });

      // Wait for batch to complete but emit results individually
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
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

      const config = {
        model: {
          name: model,
          provider,
          parameters: {
            temperature: 0.7,
            apiKey
          }
        },
        evaluator: {
          model: {
            name: model,
            provider,
            parameters: {
              temperature: 0.2,
              apiKey
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

      console.log('Running tests with config:', {
        ...config,
        model: { ...config.model, parameters: { ...config.model.parameters, apiKey: '***' } },
        evaluator: { ...config.evaluator, model: { ...config.evaluator.model, parameters: { ...config.evaluator.model.parameters, apiKey: '***' } } }
      });

      const evaluator = new LLMEvaluator(config);
      const tests = loadTests();
      console.log(`Loaded ${tests.length} tests`);
      
      // Run tests in parallel with batch size of 3
      const results = await runTestsInParallel(tests, evaluator, 3, io);
      
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