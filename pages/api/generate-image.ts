import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('✅ API route hit!');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  // Handle GET for testing
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'API route is working! Use POST to generate images.',
      timestamp: new Date().toISOString()
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    console.log('Received body:', body);
    
    const { prompt, aspectRatio = "1:1" } = body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key missing');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('🔄 Calling Google AI Studio...');
    console.log('Prompt:', prompt);
    console.log('Aspect Ratio:', aspectRatio);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatio,
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult"
          }
        })
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google AI error:', errorText);
      return res.status(response.status).json({
        error: `Google AI API error: ${response.status}`,
        details: errorText
      });
    }

    const result = await response.json();
    console.log('✅ Image generated successfully');
    
    if (!result.predictions || !result.predictions[0] || !result.predictions[0].bytesBase64Encoded) {
      console.error('❌ Unexpected response format:', result);
      return res.status(500).json({
        error: 'Unexpected response format from Google AI'
      });
    }
    
    const imageBase64 = result.predictions[0].bytesBase64Encoded;

    return res.status(200).json({
      image: imageBase64,
      success: true
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate image',
      success: false,
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}