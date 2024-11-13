import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Logger } from '@nestjs/common';
import {
  Providers,
  ModelConfig,
  ProviderModels,
} from './langchain.types';

export class LangChainService {
  private model!: BaseChatModel;
  private readonly logger = new Logger(LangChainService.name);

  constructor(config: ModelConfig) {
    this.initializeModel(config);
  }

  private initializeModel(config: ModelConfig) {
    const { provider, model, temperature = 0.7, maxTokens, apiKey } = config;

    // Validate model exists for provider
    if (!Object.values(ProviderModels[provider]).includes(model)) {
      throw new Error(
        `Model ${model} is not available for provider ${provider}. Available models: ${Object.keys(
          ProviderModels[provider],
        ).join(', ')}`,
      );
    }

    const modelConfig = {
      modelName: model,
      temperature,
      maxTokens,
      ...(apiKey && { apiKey }),
    };

    console.log('modelConfig', modelConfig, apiKey);

    switch (provider) {
      case Providers.ANTHROPIC:
        this.model = new ChatAnthropic({
          ...modelConfig,
          anthropicApiKey: apiKey,
        }) as unknown as BaseChatModel;
        break;
      case Providers.OPENAI:
        this.model = new ChatOpenAI({...modelConfig, openAIApiKey: apiKey});
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  ): Promise<string> {
    try {
      const langChainMessages: BaseMessage[] = messages.map((msg) => {
        console.log('msg', msg);
        switch (msg.role) {
          case 'system':
            return new SystemMessage(msg.content);
          case 'user':
            return new HumanMessage(msg.content);
          case 'assistant':
            return new AIMessage(msg.content);
          default:
            throw new Error(`Unsupported message role: ${msg.role}`);
        }
      });

      const startTime = Date.now();
      const response = await this.model.invoke(langChainMessages);
      const endTime = Date.now();
      
      this.logger.debug(`Chat completion took ${(endTime - startTime) / 1000}s`);
      
      return response.content as string;
    } catch (error) {
      this.logger.error('Error in chat completion:', error);
      throw error;
    }
  }

  async streamChat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    onToken: (token: string) => void,
  ): Promise<string> {
    try {
      const langChainMessages: BaseMessage[] = messages.map((msg) => {
        switch (msg.role) {
          case 'system':
            return new SystemMessage(msg.content);
          case 'user':
            return new HumanMessage(msg.content);
          case 'assistant':
            return new AIMessage(msg.content);
          default:
            throw new Error(`Unsupported message role: ${msg.role}`);
        }
      });

      let fullResponse = '';
      
      // Handle different streaming implementations
      if ('stream' in this.model) {
        const stream = await this.model.stream(langChainMessages);
        for await (const chunk of stream) {
          const token = chunk.content;
          fullResponse += token;
          onToken(token as string);
        }
      } else {
        // Fallback for models that don't support streaming
        const response = await this.chat(messages);
        fullResponse = response;
        onToken(fullResponse);
      }

      return fullResponse;
    } catch (error) {
      this.logger.error('Error in streaming chat:', error);
      throw error;
    }
  }

  async generateWithPrompt(
    prompt: string,
    systemPrompt?: string,
  ): Promise<string> {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system' as const, content: systemPrompt });
    }
    messages.push({ role: 'user' as const, content: prompt });

    return this.chat(messages);
  }

  async generateWithTemplate(
    template: string,
    variables: Record<string, string>,
    systemPrompt?: string,
  ): Promise<string> {
    let filledTemplate = template;
    for (const [key, value] of Object.entries(variables)) {
      filledTemplate = filledTemplate.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return this.generateWithPrompt(filledTemplate, systemPrompt);
  }
} 