// src/index.ts
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
 * Google Imagen (Gemini) image generation endpoint
 * POST body: { prompt: string }
 */
export const generateImageGoogle = onRequest(async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.set(corsHeaders).status(200).send("ok");
    return;
  }
  res.set(corsHeaders);

  try {
    if (req.method !== "POST") {
      sendError(res, 405, "Method not allowed", "Use POST");
      return;
    }

    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      logger.error("Invalid request body:", payload);
      sendError(res, 400, "Invalid request format", "Request body must be a JSON object");
      return;
    }

    const prompt = payload.prompt;
    if (!prompt || typeof prompt !== "string") {
      logger.error("Invalid prompt:", prompt);
      sendError(res, 400, "Prompt is required", "Prompt must be a non-empty string");
      return;
    }

    if (prompt.length > 1000) {
      sendError(res, 400, "Prompt too long", "Prompt must be less than 1000 characters");
      return;
    }

    // Get API key from secret
    const apiKey = await GOOGLE_AI_API_KEY.value();
    if (!apiKey) {
      logger.error("GOOGLE_AI_API_KEY not set");
      sendError(res, 500, "Server configuration error", "Google AI API key not configured");
      return;
    }

    logger.info("Calling Google AI API (Imagen) for prompt:", prompt.substring(0, 120));

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          // tweak parameters as needed
          sampleCount: 1,
        },
      }),
    });

    logger.info("Google AI Image API status:", apiResponse.status);

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      logger.error("Google AI API error:", errText);
      // Map common statuses
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
    logger.debug("Google API response:", JSON.stringify(data).slice(0, 1000));

    // The exact field returned can vary by API version — try common keys
    // Check for predictions[].bytesBase64Encoded or predictions[0].content or outputs etc.
    const imageBase64 =
      data?.predictions?.[0]?.bytesBase64Encoded ||
      data?.predictions?.[0]?.image?.uri ||
      data?.predictions?.[0]?.image?.b64;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      logger.error("No image data in Google AI response:", JSON.stringify(data).slice(0, 1000));
      sendError(res, 500, "Image generation failed", "No image data returned by AI service");
      return;
    }

    // If the model returned a full URI (rare), pass it through; otherwise assume base64 PNG.
    const imageUrl = imageBase64.startsWith("http")
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    res.status(200).json({ imageUrl });
  } catch (err: unknown) {
    logger.error("Unexpected error in generateImageGoogle:", err);
    sendError(res, 500, "Internal server error", err instanceof Error ? err.message : String(err));
  }
});

/**
 * Stability AI image generation endpoint (Stable Diffusion XL)
 * POST body: { prompt: string, width?: number, height?: number, steps?: number, cfgScale?: number }
 */
export const generateImageStability = onRequest(async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.set(corsHeaders).status(200).send("ok");
    return;
  }
  res.set(corsHeaders);

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

    // sensible defaults
    const width = Number(payload.width ?? 1024);
    const height = Number(payload.height ?? 1024);
    const steps = Number(payload.steps ?? 30);
    const cfgScale = Number(payload.cfgScale ?? 7);

    if (prompt.length > 2000) {
      sendError(res, 400, "Prompt too long", "Prompt must be less than 2000 characters");
      return;
    }

    const apiKey = await STABILITY_API_KEY.value();
    if (!apiKey) {
      logger.error("STABILITY_API_KEY not set");
      sendError(res, 500, "Server configuration error", "Stability API key not configured");
      return;
    }

    logger.info("Calling Stability AI for prompt:", prompt.substring(0, 120));

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
        // style_preset: "photographic" // optional
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
    logger.debug("Stability response:", JSON.stringify(respData).slice(0, 1000));

    const base64Image = respData?.artifacts?.[0]?.base64;
    if (!base64Image || typeof base64Image !== "string") {
      logger.error("No image artifact from Stability:", JSON.stringify(respData).slice(0, 1000));
      sendError(res, 500, "Image generation failed", "No image returned by Stability AI");
      return;
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;
    res.status(200).json({ imageUrl });
  } catch (err: unknown) {
    logger.error("Error in generateImageStability:", err instanceof Error ? err.message : err);
    const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || (err instanceof Error ? err.message : "Failed to generate image");
    sendError(res, status === 200 ? 500 : status, "Image generation error", message);
  }
});
