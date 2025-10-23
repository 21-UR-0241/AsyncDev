// import type { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   console.log('✅ API route hit!');
//   console.log('Method:', req.method);
//   console.log('URL:', req.url);

//   // Handle GET for testing
//   if (req.method === 'GET') {
//     return res.status(200).json({
//       message: 'API route is working! Use POST to generate images.',
//       timestamp: new Date().toISOString()
//     });
//   }

//   // Only allow POST
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const body = req.body;
//     console.log('Received body:', body);
    
//     const { prompt, aspectRatio = "1:1" } = body;
    
//     if (!prompt) {
//       return res.status(400).json({ error: 'Prompt is required' });
//     }
    
//     const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    
//     if (!apiKey) {
//       console.error('❌ API key missing');
//       return res.status(500).json({ error: 'API key not configured' });
//     }

//     console.log('🔄 Calling Google AI Studio...');
//     console.log('Prompt:', prompt);
//     console.log('Aspect Ratio:', aspectRatio);

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict?key=${apiKey}`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           instances: [{ prompt }],
//           parameters: {
//             sampleCount: 1,
//             aspectRatio: aspectRatio,
//             safetyFilterLevel: "block_some",
//             personGeneration: "allow_adult"
//           }
//         })
//       }
//     );

//     console.log('Response status:', response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ Google AI error:', errorText);
//       return res.status(response.status).json({
//         error: `Google AI API error: ${response.status}`,
//         details: errorText
//       });
//     }

//     const result = await response.json();
//     console.log('✅ Image generated successfully');
    
//     if (!result.predictions || !result.predictions[0] || !result.predictions[0].bytesBase64Encoded) {
//       console.error('❌ Unexpected response format:', result);
//       return res.status(500).json({
//         error: 'Unexpected response format from Google AI'
//       });
//     }
    
//     const imageBase64 = result.predictions[0].bytesBase64Encoded;

//     return res.status(200).json({
//       image: imageBase64,
//       success: true
//     });

//   } catch (error) {
//     console.error('❌ Error:', error);
//     return res.status(500).json({
//       error: error instanceof Error ? error.message : 'Failed to generate image',
//       success: false,
//       stack: error instanceof Error ? error.stack : undefined
//     });
//   }
// }


import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('✅ API route hit!');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'API route is working! Use POST to generate images.',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    console.log('Received body:', body);
    
    const { 
      prompt, 
      aspectRatio = "1:1",
      negativePrompt = "",
      mode = "high-quality"
    } = body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key missing');
      return res.status(500).json({ error: 'API key not configured' });
    }
    const enhancedPrompt = enhancePrompt(prompt);
    const model = mode === "high-quality" 
      ? "imagen-3.0-generate-001"
      : "imagen-3.0-fast-generate-001";

    console.log('🔄 Calling Google AI Studio...');
    console.log('Model:', model);
    console.log('Original Prompt:', prompt);
    console.log('Enhanced Prompt:', enhancedPrompt);
    console.log('Aspect Ratio:', aspectRatio);

    const requestBody: any = {
      instances: [{ prompt: enhancedPrompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult",
        language: "en",
        addWatermark: false,
      }
    };

    if (negativePrompt) {
      requestBody.instances[0].negativePrompt = negativePrompt;
      console.log('Negative Prompt:', negativePrompt);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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
      success: true,
      enhancedPrompt: enhancedPrompt
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

function enhancePrompt(originalPrompt: string): string {
  const wordCount = originalPrompt.split(/\s+/).length;
  if (wordCount > 100) {
    return originalPrompt;
  }

  const qualityTerms = [
    'high quality',
    'detailed',
    'professional',
    '8k',
    '4k',
    'ultra detailed',
    'photorealistic'
  ];
  
  const hasQualityTerm = qualityTerms.some(term => 
    originalPrompt.toLowerCase().includes(term)
  );

  if (hasQualityTerm) {
    // Already has quality terms, just return original
    return originalPrompt;
  }

  // Add quality enhancers based on content type
  const isPhotographic = /photo|photograph|picture|image of/i.test(originalPrompt);
  const isArtistic = /painting|drawing|illustration|art|artwork/i.test(originalPrompt);
  const is3D = /3d|render|cgi|realistic/i.test(originalPrompt);

  let enhancement = '';
  
  if (isPhotographic) {
    enhancement = ', professional photography, high resolution, sharp focus, detailed';
  } else if (isArtistic) {
    enhancement = ', highly detailed, professional artwork, intricate details';
  } else if (is3D) {
    enhancement = ', high quality 3D render, detailed textures, professional lighting';
  } else {
    enhancement = ', highly detailed, high quality, professional';
  }

  return originalPrompt + enhancement;
}