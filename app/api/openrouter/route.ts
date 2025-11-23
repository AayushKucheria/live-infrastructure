import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractResponseText, OpenRouterMessage } from '@/app/lib/openrouter';

export const runtime = 'nodejs';

export interface OpenRouterAPIRequest {
  messages: OpenRouterMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterAPIResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable.',
        } as OpenRouterAPIResponse,
        { status: 500 }
      );
    }

    // Parse request body
    const body: OpenRouterAPIRequest = await request.json();

    // Validate request
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: messages array is required and must not be empty',
        } as OpenRouterAPIResponse,
        { status: 400 }
      );
    }

    // Validate message format
    for (const message of body.messages) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request: each message must have role and content',
          } as OpenRouterAPIResponse,
          { status: 400 }
        );
      }
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request: message role must be system, user, or assistant',
          } as OpenRouterAPIResponse,
          { status: 400 }
        );
      }
    }

    // Call OpenRouter API
    const response = await callOpenRouter(body.messages, {
      model: body.model,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      top_p: body.top_p,
      frequency_penalty: body.frequency_penalty,
      presence_penalty: body.presence_penalty,
    });

    // Extract response text
    const content = extractResponseText(response);

    // Return success response
    return NextResponse.json({
      success: true,
      content,
      usage: response.usage,
    } as OpenRouterAPIResponse);
  } catch (error) {
    console.error('OpenRouter API error:', error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      } as OpenRouterAPIResponse,
      { status: 500 }
    );
  }
}

