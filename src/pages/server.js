const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-image', async (req, res) => {
  console.log('✅ API route hit!');
  
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    console.log('Received prompt:', prompt);

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key missing');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('🔄 Calling Google AI Studio...');

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google AI error:', errorText);
      return res.status(response.status).json({
        error: `Google AI API error: ${response.status}`
      });
    }

    const result = await response.json();
    console.log('✅ Image generated successfully');
    
    const imageBase64 = result.predictions[0].bytesBase64Encoded;

    return res.json({ 
      image: imageBase64,
      success: true 
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate image',
      success: false
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});