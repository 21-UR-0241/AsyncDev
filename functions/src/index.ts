import { onRequest } from "firebase-functions/v2/https";
import { Request, Response } from "express";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import axios from "axios";

/**
 * Note:
 * - Do NOT hard-code API keys in source.
 * - Use firebase functions:secrets:set to set secrets (see below).
 */

// Define secrets (these are *names* only — values are stored via firebase CLI)
const GOOGLE_AI_API_KEY = defineSecret("GOOGLE_AI_API_KEY");
const STABILITY_API_KEY = defineSecret("STABILITY_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper to send a JSON error
function sendError(res: Response, status: number, error: string, details?: string) {
  res.set(corsHeaders).status(status).json({ error, details });
}

/**
 * Main image generation endpoint (uses Stability AI)
 * This is the function your frontend is calling
 */
export const generateImage = onRequest(
  {
    secrets: [STABILITY_API_KEY],
    timeoutSeconds: 300,
    memory: "512MiB"
  },
  async (req, res) => {
    // Handle CORS manually
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    });

    // CORS preflight
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      if (req.method !== "POST") {
        sendError(res, 405, "Method not allowed", "Use POST");
        return;
      }

      const payload = req.body;
      if (!payload || typeof payload !== "object") {
        sendError(res, 400, "Invalid request format", "Request body must be a JSON object");
        return;
      }

      const prompt = payload.prompt;
      if (!prompt || typeof prompt !== "string") {
        sendError(res, 400, "Prompt is required", "Prompt must be a non-empty string");
        return;
      }

      const width = Number(payload.width ?? 1024);
      const height = Number(payload.height ?? 1024);
      const steps = Number(payload.steps ?? 30);
      const cfgScale = Number(payload.cfgScale ?? 7);

      if (prompt.length > 2000) {
        sendError(res, 400, "Prompt too long", "Prompt must be less than 2000 characters");
        return;
      }

      const apiKey = STABILITY_API_KEY.value();
      if (!apiKey) {
        logger.error("STABILITY_API_KEY not set");
        sendError(res, 500, "Server configuration error", "Stability API key not configured. Please contact support.");
        return;
      }

      logger.info("Generating image for prompt:", prompt.substring(0, 120));

      const stabilityUrl = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

      const response = await axios.post(
        stabilityUrl,
        {
          text_prompts: [{ text: prompt, weight: 1 }],
          cfg_scale: cfgScale,
          height,
          width,
          steps,
          samples: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 120000,
        }
      );

      const respData = response.data;
      logger.debug("Stability response received");

      const base64Image = respData?.artifacts?.[0]?.base64;
      if (!base64Image || typeof base64Image !== "string") {
        logger.error("No image artifact from Stability");
        sendError(res, 500, "Image generation failed", "No image returned by AI service");
        return;
      }

      const imageUrl = `data:image/png;base64,${base64Image}`;

      res.set(corsHeaders);
      res.status(200).json({ imageUrl, success: true });

      logger.info("Image generated successfully");

    } catch (err: unknown) {
      logger.error("Error in generateImage:", err instanceof Error ? err.message : err);
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosError.response?.status || 500;
      const message = axiosError.response?.data?.message || (err instanceof Error ? err.message : "Failed to generate image");
      sendError(res, status === 200 ? 500 : status, "Image generation error", message);
    }
  }
);

/**
 * Google Imagen image generation endpoint
 */
export const generateImageGoogle = onRequest(
  {
    secrets: [GOOGLE_AI_API_KEY],
    cors: true,
    timeoutSeconds: 300,
    memory: "512MiB"
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders).status(204).send("");
      return;
    }
    res.set(corsHeaders);

    try {
      if (req.method !== "POST") {
        sendError(res, 405, "Method not allowed", "Use POST");
        return;
      }

      const payload = req.body;
      const prompt = payload?.prompt;

      if (!prompt || typeof prompt !== "string") {
        sendError(res, 400, "Prompt is required", "Prompt must be a non-empty string");
        return;
      }

      if (prompt.length > 1000) {
        sendError(res, 400, "Prompt too long", "Prompt must be less than 1000 characters");
        return;
      }

      const apiKey = GOOGLE_AI_API_KEY.value();
      if (!apiKey) {
        logger.error("GOOGLE_AI_API_KEY not set");
        sendError(res, 500, "Server configuration error", "Google AI API key not configured");
        return;
      }

      logger.info("Calling Google AI API for prompt:", prompt.substring(0, 120));

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

      const apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1 },
        }),
      });

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        logger.error("Google AI API error:", errText);

        if (apiResponse.status === 400) {
          sendError(res, 400, "Invalid prompt", "The prompt may violate content rules. Try rephrasing.");
          return;
        }
        if (apiResponse.status === 403) {
          sendError(res, 403, "API access denied", "API key invalid or lacks permissions.");
          return;
        }
        if (apiResponse.status === 429) {
          sendError(res, 429, "Rate limit exceeded", "Too many requests. Please retry later.");
          return;
        }
        sendError(res, 502, "AI service error", `Google AI returned ${apiResponse.status}`);
        return;
      }

      const data = await apiResponse.json();
      const imageBase64 =
        data?.predictions?.[0]?.bytesBase64Encoded ||
        data?.predictions?.[0]?.image?.uri ||
        data?.predictions?.[0]?.image?.b64;

      if (!imageBase64) {
        logger.error("No image data in Google AI response");
        sendError(res, 500, "Image generation failed", "No image data returned");
        return;
      }

      const imageUrl = imageBase64.startsWith("http")
        ? imageBase64
        : `data:image/png;base64,${imageBase64}`;

      res.set(corsHeaders);
      res.status(200).json({ imageUrl, success: true });

    } catch (err: unknown) {
      logger.error("Error in generateImageGoogle:", err);
      sendError(res, 500, "Internal server error", err instanceof Error ? err.message : String(err));
    }
  }
);
