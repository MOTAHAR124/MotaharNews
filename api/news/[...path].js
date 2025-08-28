export default async function handler(req, res) {
  try {
    const key1 = process.env.VITE_NEWS_API_KEY_1 || '';
    const key2 = process.env.VITE_NEWS_API_KEY_2 || '';

    if (!key1 && !key2) {
      console.warn('[api] No API keys found. Set VITE_NEWS_API_KEY_1 and/or VITE_NEWS_API_KEY_2 in Vercel env.');
    }

    const segs = Array.isArray(req.query.path) ? req.query.path : (req.query.path ? [req.query.path] : []);
    const pathSuffix = segs.join('/');
    const qIndex = req.url.indexOf('?');
    const search = qIndex >= 0 ? req.url.slice(qIndex) : '';
    const targetUrl = `https://newsapi.org/${pathSuffix}${search}`;

    const useKeyHeader = (req.headers['x-use-key'] || '1').toString();
    const pickKey = (useKeyHeader === '2' && key2) ? key2 : key1;

    const doFetch = async (apiKey) => fetch(targetUrl, {
      method: req.method,
      // Only headers we need to send upstream; do not forward host/cookies
      headers: {
        'X-Api-Key': apiKey || '',
        'Content-Type': 'application/json',
      },
    });

    let upstream = await doFetch(pickKey);
    if ((upstream.status === 401 || upstream.status === 429) && key2 && pickKey !== key2) {
      upstream = await doFetch(key2);
    }

    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type') || '';
    if (contentType) res.setHeader('Content-Type', contentType);
    const body = await upstream.text();
    res.send(body);
  } catch (err) {
    console.error('[api] Proxy error:', err);
    res.status(500).json({ status: 'error', message: 'Proxy error', details: String(err) });
  }
}
