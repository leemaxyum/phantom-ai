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
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (!apiKey) {
    sendSse(res, { error: "Missing GROQ_API_KEY in .env" });
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
      error: err instanceof Error ? err.message : "Unknown error",
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