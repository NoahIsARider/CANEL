import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const port = Number(process.env.PORT || 5000);

// HMR 参数按环境变量注入；本地开发留空 = 使用 Vite 默认（跟随当前 host/port）。
// 之前的硬编码 (path '/hot/vite-hmr', port 6000, clientPort 443) 只对 Coze 云端反代成立，
// 本地跑 dev 时浏览器会去连 ws://127.0.0.1:443/... 必然 ERR_CONNECTION_REFUSED。
const hmrPort = process.env.VITE_HMR_PORT ? Number(process.env.VITE_HMR_PORT) : undefined;
const hmrClientPort = process.env.VITE_HMR_CLIENT_PORT
  ? Number(process.env.VITE_HMR_CLIENT_PORT)
  : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: {
      overlay: true,
      ...(process.env.VITE_HMR_PATH ? { path: process.env.VITE_HMR_PATH } : {}),
      ...(hmrPort ? { port: hmrPort } : {}),
      ...(hmrClientPort ? { clientPort: hmrClientPort } : {}),
      timeout: 30000,
    },
    watch: {
      usePolling: true,
      interval: 100,
    }
  },
});
