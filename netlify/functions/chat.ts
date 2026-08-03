import type { Handler } from "@netlify/functions";
import {
  handleChatRequest,
  type ChatRequestBody,
} from "../../shared/chatHandler.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: "Method Not Allowed",
    };
  }

  try {
    const body: ChatRequestBody = JSON.parse(event.body || "{}");

    const apiKey = body.apiKey?.trim() || process.env.GROQ_API_KEY || "";

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
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
      body: chunks.join(""),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown server error",
      }),
    };
  }
};