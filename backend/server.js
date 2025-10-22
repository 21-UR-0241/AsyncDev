const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000; // Changed to 10000 to match frontend expectation

// Enable CORS for all origins
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'API is running',
    message: 'Async Studio Image Generation API',
    version: '1.0.0'
  });
});

// Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  console.log('Received image generation request');

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt is required',
        details: 'Prompt must be a non-empty string'
      });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({
        error: 'Prompt too long',
        details: 'Maximum 2000 characters'
      });
    }

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_AI_STUDIO_API_KEY not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'API key not configured. Please contact support.'
      });
    }

    console.log('Calling Google AI Studio with prompt:', prompt.substring(0, 100));

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        instances: [{ prompt: prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1", // You can adjust aspectRatio as needed
          safetyFilterLevel: "block_some", 
          personGeneration: "allow_adult" 
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 120000,
      }
    );

    const base64Image = response.data?.predictions?.[0]?.bytesBase64Encoded;
    if (!base64Image) {
      console.error('No image artifact returned from Google AI');
      return res.status(500).json({
        error: 'Image generation failed',
        details: 'No image data returned by AI service'
      });
    }

    console.log('Image generated successfully');
    res.json({
      image: base64Image,
      success: true
    });

  } catch (error) {
    console.error('Error generating image:', error.message);

    if (error.response) {
      console.error('Google AI Studio error:', {
        status: error.response.status,
        data: error.response.data
      });

      const status = error.response.status;

      if (status === 401 || status === 403) {
        return res.status(500).json({
          error: 'API authentication failed',
          details: 'Invalid API key. Please contact support.'
        });
      }

      if (status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.'
        });
      }

      return res.status(500).json({
        error: 'Image generation failed',
        details: error.response.data?.message || error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    details: 'Endpoint not found'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/generate-image`);
});
