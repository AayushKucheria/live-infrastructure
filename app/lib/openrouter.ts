// OpenRouter API client for server-side use

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model?: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterChoice {
  index: number;
  message: OpenRouterMessage;
  finish_reason: string | null;
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: OpenRouterChoice[];
  usage: OpenRouterUsage;
  created: number;
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini'; // Default model, can be overridden

/**
 * Calls the OpenRouter API with the provided messages and options
 * @param messages Array of messages for the conversation
 * @param options Additional options for the API call
 * @returns Promise with the OpenRouter API response
 * @throws Error if API key is missing or API call fails
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  } = {}
): Promise<OpenRouterResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const requestBody: OpenRouterRequest = {
    model: options.model || DEFAULT_MODEL,
    messages,
    ...(options.temperature !== undefined && { temperature: options.temperature }),
    ...(options.max_tokens !== undefined && { max_tokens: options.max_tokens }),
    ...(options.top_p !== undefined && { top_p: options.top_p }),
    ...(options.frequency_penalty !== undefined && { frequency_penalty: options.frequency_penalty }),
    ...(options.presence_penalty !== undefined && { presence_penalty: options.presence_penalty }),
  };

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Live Coordination Infrastructure',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData: OpenRouterError = await response.json().catch(() => ({
        error: {
          message: `HTTP ${response.status}: ${response.statusText}`,
          type: 'http_error',
        },
      }));

      throw new Error(
        errorData.error?.message || `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenRouter API returned no choices');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error calling OpenRouter API');
  }
}

/**
 * Extracts the assistant's response text from an OpenRouter response
 * @param response OpenRouter API response
 * @returns The assistant's message content
 */
export function extractResponseText(response: OpenRouterResponse): string {
  return response.choices[0]?.message?.content || '';
}

