// Client-side AI utility for interacting with OpenRouter API

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICallOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Calls the AI API through the server-side route
 * @param messages Array of messages for the conversation
 * @param options Additional options for the API call
 * @returns Promise with the AI response
 * @throws Error if the API call fails
 */
export async function callAI(
  messages: AIMessage[],
  options: AICallOptions = {}
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        ...options,
      }),
    });

    const data: AIResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error calling AI API');
  }
}

/**
 * Convenience function for a simple user message
 * @param userMessage The user's message
 * @param systemMessage Optional system message to set context
 * @param options Additional options for the API call
 * @returns Promise with the AI response content
 */
export async function askAI(
  userMessage: string,
  systemMessage?: string,
  options: AICallOptions = {}
): Promise<string> {
  const messages: AIMessage[] = [];
  
  if (systemMessage) {
    messages.push({ role: 'system', content: systemMessage });
  }
  
  messages.push({ role: 'user', content: userMessage });

  const response = await callAI(messages, options);
  
  if (!response.content) {
    throw new Error('AI response has no content');
  }

  return response.content;
}

