import OpenAI from "openai";
import type { IncomingMessage, ServerResponse } from "node:http";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  systemPrompt: string;
  apiKey?: string;
}

const MAX_MESSAGES = 24;
const MAX_MESSAGE_LENGTH = 6_000;
const MAX_SYSTEM_PROMPT_LENGTH = 4_000;
const MAX_API_KEY_LENGTH = 256;

export function validateChatRequest(value: unknown): ChatRequestBody {
  if (!value || typeof value !== "object") throw new Error("Invalid request body.");
  const body = value as Partial<ChatRequestBody>;
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    throw new Error("Invalid message list.");
  }
  if (typeof body.systemPrompt !== "string" || body.systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
    throw new Error("Invalid system prompt.");
  }
  if (typeof body.apiKey !== "string" || body.apiKey.trim().length === 0 || body.apiKey.length > MAX_API_KEY_LENGTH) {
    throw new Error("A Groq API key is required.");
  }
  const messages: ChatMessage[] = body.messages.map((message) => {
    if (!message || typeof message !== "object") throw new Error("Invalid message.");
    const candidate = message as Partial<ChatMessage>;
    if ((candidate.role !== "user" && candidate.role !== "assistant") || typeof candidate.content !== "string" || candidate.content.length === 0 || candidate.content.length > MAX_MESSAGE_LENGTH) {
      throw new Error("Invalid message.");
    }
    return { role: candidate.role, content: candidate.content };
  });
  return { messages, systemPrompt: body.systemPrompt, apiKey: body.apiKey.trim() };
}

function sendSse(res: ServerResponse, data: Record<string, string>) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function handleChatRequest(
  body: ChatRequestBody,
  apiKey: string,
  res: ServerResponse,
): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
remove wildcard cors  if (!apiKey) {
    sendSse(res, { error: "A Groq API key is required." });
    res.end();
    return;
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const messages = [
      {
        role: "system" as const,
        content: body.systemPrompt,
      },
      ...body.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      stream: true,
      temperature: 0.8,
    });

    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content;

      if (text) {
        sendSse(res, { chunk: text });
      }
    }

    sendSse(res, { done: "true" });
  } catch (err) {
    console.error(err);

    sendSse(res, {
      error: "The chat service could not complete this request.",
    });
  } finally {
    res.end();
  }
}

export function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}