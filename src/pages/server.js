import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Start prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
        input: { prompt, aspect_ratio: "1:1" }
      })
    });
    
    let prediction = await response.json();
    
    // Poll for completion
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}`,
          }
        }
      );
      
      prediction = await pollResponse.json();
    }
    
    res.json({ imageUrl: prediction.output[0] });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));