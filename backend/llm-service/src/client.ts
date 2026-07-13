const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens: number;
  temperature: number;
}

interface OpenRouterResponse {
  choices: { message: { content: string } }[];
}

function getApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY;
}

function getModel(): string {
  return process.env.LLM_MODEL || 'hermes-3-llama-3.1-405b';
}

export async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const body: OpenRouterRequest = {
    model: getModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 512,
    temperature: 0.3,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://rased.app',
      'X-Title': 'Rased',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
}
