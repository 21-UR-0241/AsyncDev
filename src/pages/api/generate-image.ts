// pages/api/generate-image.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, aspectRatio = "1:1" } = req.body;

    // Check if prompt is provided
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Simulate image generation (you can replace with your actual image generation logic)
    const imageBase64 = await generateImage(prompt, aspectRatio);

    // Return the generated image
    res.status(200).json({ image: imageBase64 });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({ error: "Failed to generate image" });
  }
}

// Simulate an image generation function
async function generateImage(prompt: string, aspectRatio: string) {
  // Simulate the image creation process (you can replace this with Google AI Studio API call)
  return 'base64encodedimage';
}
