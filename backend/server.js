const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = process.env.REGION;
const VAL_REGION = process.env.VAL_REGION;

app.get('/account/:gameName/:tagLine', async (req, res) =>
{
  try
  {
    const { gameName, tagLine } = req.params;

    if (!gameName || !tagLine)
    {
      return res.status(400).json({ error: 'Game name and tagline are required' });
    }

    const url = `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;

    const response = await axios.get(url,
    {
      headers:
      {
        'X-Riot-Token': RIOT_API_KEY,
      },
    });

    return res.json(response.data);
  }catch (error)
  {
    console.error('Error fetching account information:', error.message);

    if (error.response)
    {
      const status = error.response.status;

      switch (status)
      {
        case 400:
          return res.status(400).json({ error: 'Bad request' });
        case 401:
          return res.status(401).json({ error: 'Unauthorized - check your API key' });
        case 403:
          return res.status(403).json({ error: 'Forbidden - invalid API key or rate limit exceeded' });
        case 404:
          return res.status(404).json({ error: 'Account not found' });
        case 429:
          return res.status(429).json({ error: 'Rate limit exceeded' });
        default:
          return res.status(500).json({ error: 'An error occurred with the Riot API' });
      }
    }

    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/matches/:puuid', async (req, res) => {
  const { puuid } = req.params;

  if (!puuid) {
    return res.status(400).json({ error: 'PUUID is required' });
  }

  const url = `https://${VAL_REGION}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching match list:', error.response?.data || error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data });
    }

    res.status(500).json({ error: 'Failed to fetch match list' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
