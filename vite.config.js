import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const key1 = env.VITE_NEWS_API_KEY_1 || '';
  const key2 = env.VITE_NEWS_API_KEY_2 || '';

  return {
    base: "/",
    plugins: [react()],
    server: {
      proxy: {
        '/newsapi': {
          target: 'https://newsapi.org',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/newsapi/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const useKey = (req.headers['x-use-key'] || '1').toString();
              const selected = useKey === '2' && key2 ? key2 : key1;
              if (selected) {
                proxyReq.setHeader('X-Api-Key', selected);
              }
            });
          },
        },
      },
    },
  }
})
