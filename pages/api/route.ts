import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    message: 'Generate image API is ready. Use POST to generate images.',
    status: 'ok'
  });
}

export async function POST(request: Request) {
  console.log('🚀 Generate image API called');
  
  try {
    const body = await request.json();
    const { prompt, aspectRatio = "1:1" } = body;
    
    console.log('📝 Prompt:', prompt);
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required', success: false },
        { status: 400 }
      );
    }
    
    // Get API key from environment
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      console.error('❌ No API key found');
      return NextResponse.json(
        { error: 'API key not configured', success: false },
        { status: 500 }
      );
    }

    console.log('🔄 Calling Google AI API...');
    
    // Call Google AI API
    const aiResponse = await fetch(
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

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Google AI error:', errorText);
      return NextResponse.json(
        { 
          error: `Google AI API error: ${aiResponse.status}`,
          details: errorText,
          success: false 
        },
        { status: aiResponse.status }
      );
    }

    const result = await aiResponse.json();
    console.log('✅ Image generated');
    
    // Extract base64 image
    if (!result.predictions?.[0]?.bytesBase64Encoded) {
      console.error('❌ Invalid response format');
      return NextResponse.json(
        { error: 'Invalid response from Google AI', success: false },
        { status: 500 }
      );
    }
    
    const imageBase64 = result.predictions[0].bytesBase64Encoded;

    return NextResponse.json({
      image: imageBase64,
      success: true
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}