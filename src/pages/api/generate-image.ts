// pages/api/generate-image.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, aspectRatio = "1:1" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const imageBase64 = await generateImage(prompt, aspectRatio);

    // Return the generated image
    res.status(200).json({ image: imageBase64 });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({ error: "Failed to generate image" });
  }
}
async function generateImage(prompt: string, aspectRatio: string) {
  return 'base64encodedimage';
}
