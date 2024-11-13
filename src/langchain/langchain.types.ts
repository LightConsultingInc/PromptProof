import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export enum Providers {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
}

export type ProviderModel = {
  [Providers.ANTHROPIC]: typeof ChatAnthropic;
  [Providers.OPENAI]: typeof ChatOpenAI;
};

export enum AnthropicModels {
  CLAUDE_3_5_SONNET = 'claude-3-5-sonnet-20241022',
  CLAUDE_3_5_HAIKU = 'claude-3-5-haiku-20241022',
  CLAUDE_3_OPUS = 'claude-3-opus-20240620',
  CLAUDE_3_SONNET = 'claude-3-sonnet-20240620', 
  CLAUDE_3_HAIKU = 'claude-3-haiku-20240620',
  CLAUDE_2_1 = 'claude-2.1'
}

export enum OpenAIModels {
  GPT_4_O = 'gpt-4o',
  GPT_4_TURBO = 'gpt-4-turbo-preview',
  GPT_4 = 'gpt-4',
  GPT_3_5_TURBO = 'gpt-3.5-turbo'
}

export const ProviderModels = {
  [Providers.ANTHROPIC]: AnthropicModels,
  [Providers.OPENAI]: OpenAIModels
} as const;

export type Models = AnthropicModels | OpenAIModels;

export interface ModelConfig {
  provider: Providers;
  model: Models;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  systemPrompt?: string;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    [key: string]: any;
  };
}