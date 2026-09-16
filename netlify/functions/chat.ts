import type { Handler } from "@netlify/functions";
import {
  handleChatRequest,
  validateChatRequest,
} from "../../shared/chatHandler.js";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
method cors      body: "Method Not Allowed",
    };
  }

  try {
    if (!event.body || event.body.length > 80_000) {
      return { statusCode: 413, body: JSON.stringify({ error: "Request is too large." }) };
    }
    const body = validateChatRequest(JSON.parse(event.body));
    // This public endpoint is deliberately BYOK-only. Do not fall back to a
    // deployment secret here: an unauthenticated endpoint would expose it to abuse.
    const apiKey = body.apiKey!;

    const chunks: string[] = [];

    const mockRes = {
      setHeader() {
        return mockRes;
      },

      write(chunk: string) {
        chunks.push(chunk);
        return true;
      },

      end() {},
    } as any;

    await handleChatRequest(body, apiKey, mockRes);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
      body: chunks.join(""),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Invalid chat request." }),
    };
  }
};