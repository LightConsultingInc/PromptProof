import yargs from 'yargs';
import { runTests } from './runner';
import { Providers, AnthropicModels, Models } from './langchain/langchain.types';
import { 
  semanticSimilarityMetric, 
  bleuScoreMetric, 
  rougeScoreMetric 
} from './metrics/semantic';
import { RunnerConfig } from './runner';

interface CliOptions {
  watch?: boolean;
  pattern?: string;
  provider?: Providers;
  model?: string;
  evaluatorModel?: string;
  temperature?: number;
  apiKey?: string;
}

const cli = yargs
  .usage('Usage: $0 [options] [pattern]')
  .option('watch', {
    alias: 'w',
    type: 'boolean',
    description: 'Watch files for changes and rerun tests'
  })
  .option('provider', {
    alias: 'p',
    type: 'string',
    choices: Object.values(Providers),
    default: Providers.ANTHROPIC,
    description: 'LLM provider to use'
  })
  .option('model', {
    alias: 'm',
    type: 'string',
    description: 'Model to evaluate'
  })
  .option('evaluatorModel', {
    alias: 'e',
    type: 'string',
    description: 'Model to use for evaluation'
  })
  .option('temperature', {
    alias: 't',
    type: 'number',
    default: 0.7,
    description: 'Temperature for model generation'
  })
  .option('apiKey', {
    alias: 'k',
    type: 'string',
    description: 'API key for the provider'
  })
  .help('h')
  .alias('h', 'help');

const argv = cli.argv as unknown as CliOptions;

// Set default models based on provider
const provider = argv.provider || Providers.ANTHROPIC;
const defaultModel = AnthropicModels.CLAUDE_3_SONNET;
const defaultEvaluatorModel = AnthropicModels.CLAUDE_3_OPUS;

const config: RunnerConfig = {
  model: {
    name: argv.model as Models || defaultModel,
    provider,
    parameters: {
      temperature: argv.temperature,
      apiKey: argv.apiKey
    }
  },
  evaluator: {
    model: {
      name: argv.evaluatorModel as Models || defaultEvaluatorModel,
      provider,
      parameters: {
        temperature: 0.2,
        apiKey: argv.apiKey
      }
    }
  },
  // Add default metrics
  metrics: [
    semanticSimilarityMetric,
    bleuScoreMetric,
    rougeScoreMetric
  ],
  pattern: argv.pattern || '**/*.test.ts',
  watch: argv.watch,
  similarityThreshold: 0.8
};

runTests(config); 