// ABOUTME: Vite integration for Express server
// ABOUTME: Handles dev middleware and production static file serving

import type { Application, Request, Response } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer, loadConfigFromFile, type UserConfig } from 'vite';

const isDev = process.env.COZE_PROJECT_ENV !== 'PROD';

/**
 * 集成 Vite 开发服务器（中间件模式）
 *
 * 注意：这里**不能** `import viteConfig from '../vite.config'` 再整包内联。
 * 那样做会让 `vite.config.ts` 被求值两次（一次由 tsx 的模块加载器，一次由 Vite
 * 自己的配置加载器），于是两个 `react()` 插件实例各自跑一遍 transform，
 * react-refresh preamble 被注入两遍 → JSX 模块全部 500。
 *
 * 正确做法：用 `loadConfigFromFile` 显式加载一次配置文件，再叠加 dev 需要的字段。
 */
export async function setupViteMiddleware(app: Application) {
  const loaded = await loadConfigFromFile(
    { mode: 'development', command: 'serve' },
    path.resolve(process.cwd(), 'vite.config.ts')
  );

  const config: UserConfig = loaded?.config ?? {};

  const vite = await createViteServer({
    ...config,
    configFile: false,
    server: {
      ...config.server,
      middlewareMode: true,
    },
    appType: 'spa',
  });

  // 使用 Vite middleware
  app.use(vite.middlewares);

  console.log('🚀 Vite dev server initialized');
}

/**
 * 设置生产环境静态文件服务
 */
export function setupStaticServer(app: Application) {
  const distPath = path.resolve(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Please run "pnpm build" first.');
    process.exit(1);
  }

  // 1. 服务静态文件（如果存在对应文件则直接返回）
  app.use(express.static(distPath));

  // 2. SPA fallback - 所有未处理的请求返回 index.html
  // 到达这里的请求说明：
  //   - 不是 API 请求（已被前面注册的路由处理）
  //   - 不是静态文件（express.static 未找到对应文件）
  //   - 需要返回 index.html 让前端路由处理
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  console.log('📦 Serving static files from dist/');
}

/**
 * 根据环境设置 Vite
 */
export async function setupVite(app: Application) {
  if (isDev) {
    await setupViteMiddleware(app);
  } else {
    setupStaticServer(app);
  }
}
