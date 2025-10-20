const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'running', service: 'Async Studio API' });
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not set' });
    }

    console.log('Generating image...');

    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: \Bearer \\,
        },
        timeout: 120000,
      }
    );

    const base64Image = response.data?.artifacts?.[0]?.base64;
    if (!base64Image) {
      return res.status(500).json({ error: 'No image generated' });
    }

    const imageUrl = \data:image/png;base64,\\;
    res.json({ imageUrl, success: true });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Failed', 
      details: error.response?.data?.message || error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\Server on port \\);
});
