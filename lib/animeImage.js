const axios = require('axios');

const WAIFU_BASE = 'https://api.waifu.pics/sfw';
const NEKOS_BASE = 'https://nekos.life/api/v2/img';

const actionMap = {
  kiss: 'kiss',
  hug: 'hug',
  hugh: 'hug',
  cuddle: 'cuddle',
  slap: 'slap',
  punch: 'punch',
  kill: 'kill',
  marry: 'cuddle',
  advice: 'waifu',
  poke: 'poke',
  pat: 'pat',
  wink: 'wink',
  cry: 'cry'
};

function parseImageUrl(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;
  return data.url || data.link || data.image || null;
}

async function fetchAnimeImage(action) {
  const endpoint = (actionMap[action] || 'waifu').toLowerCase();
  const urls = [
    `${WAIFU_BASE}/${endpoint}`,
    `${NEKOS_BASE}/${endpoint}`,
    `${WAIFU_BASE}/waifu`
  ];

  for (const url of urls) {
    try {
      const res = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      const imageUrl = parseImageUrl(res.data);
      if (imageUrl) return imageUrl;
    } catch (err) {
      // try next source
    }
  }

  return null;
}

module.exports = { fetchAnimeImage };
