import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Le frontend appelle l'API en chemin relatif (/api) — voir VITE_API_URL
// dans .env. Vite (dev et preview) redirige /api vers le backend depuis la
// machine elle-même (VITE_API_PROXY_TARGET), donc le navigateur n'a jamais
// besoin de connaître l'IP ou le réseau utilisés pour charger la page.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:4000';
  const proxy = { '/api': { target: apiProxyTarget, changeOrigin: true } };

  return {
    plugins: [react()],
    server: { port: 5173, proxy },
    preview: { proxy },
  };
});
