import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, aspectRatio = "1:1" } = req.body;

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google AI Studio API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt,
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatio,
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult"
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google AI Studio API Error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const imageBase64 = result.predictions[0].bytesBase64Encoded;

    return res.status(200).json({ 
      image: imageBase64,
      success: true 
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate image',
      success: false
    });
  }
}