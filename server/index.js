import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Determine __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;
const KEY1 = process.env.VITE_NEWS_API_KEY_1 || '';
const KEY2 = process.env.VITE_NEWS_API_KEY_2 || '';

if (!KEY1 && !KEY2) {
  console.warn('[server] WARNING: No API keys found. Set VITE_NEWS_API_KEY_1 and VITE_NEWS_API_KEY_2 env vars.');
}

// Proxy endpoint: forwards to NewsAPI with server-side API key
app.use('/api', async (req, res) => {
  try {
    const targetUrl = `https://newsapi.org${req.originalUrl.replace(/^\/api/, '')}`;
    // choose key by header or default
    const useKeyHeader = (req.headers['x-use-key'] || '1').toString();
    const selectKey = (useKeyHeader === '2' && KEY2) ? KEY2 : KEY1;

    const doFetch = async (apiKey) => fetch(targetUrl, {
      method: req.method,
      headers: {
        'X-Api-Key': apiKey || '',
        'Content-Type': 'application/json',
      },
    });

    let upstream = await doFetch(selectKey);
    // If rate-limited or unauthorized and we have an alternate key not already used, retry once
    if ((upstream.status === 401 || upstream.status === 429) && KEY2 && selectKey !== KEY2) {
      upstream = await doFetch(KEY2);
    }

    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type') || '';
    if (contentType) res.setHeader('Content-Type', contentType);
    const body = await upstream.text();
    res.send(body);
  } catch (err) {
    console.error('[server] Proxy error:', err);
    res.status(500).json({ status: 'error', message: 'Proxy error', details: String(err) });
  }
});

// Serve static files from dist
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] Running on port ${PORT}`);
});
