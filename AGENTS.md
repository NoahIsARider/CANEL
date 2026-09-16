# 项目上下文

## 技术栈

- **核心**: Vite 7, React 19, TypeScript, Express
- **UI**: Tailwind CSS v3
- **拖拽**: @dnd-kit
- **图标**: lucide-react
- **Markdown**: marked

## 目录结构

```
├── scripts/            # 构建与启动脚本
├── server/             # Express 服务端
│   ├── routes/         # API 路由
│   ├── server.ts       # 服务入口
│   └── vite.ts         # Vite 中间件集成
├── src/                # 前端源码
│   ├── main.tsx        # React 入口
│   ├── App.tsx         # 根组件（路由判断：登录/Dashboard）
│   ├── Dashboard.tsx   # 主仪表盘页面
│   ├── store.tsx       # 全局状态管理（React Context + localStorage）
│   ├── types.ts        # TypeScript 类型定义
│   ├── utils.ts        # 工具函数
│   ├── index.css       # 全局样式 + CSS 变量（Design Tokens）
│   ├── components/
│   │   ├── ContextTabBar.tsx    # 顶部情境 Tab 栏
│   │   ├── BottomBar.tsx        # 底部工具栏
│   │   ├── UserMenu.tsx         # 用户菜单（主题切换/登出）
│   │   ├── CardGrid.tsx         # 卡片网格（dnd-kit 拖拽排序）
│   │   ├── CardContainer.tsx    # 通用卡片容器（拖拽/编辑/删除）
│   │   ├── CardRenderer.tsx     # 卡片类型分发渲染
│   │   ├── CardConfigModal.tsx  # 卡片配置模态框（7 种表单）
│   │   ├── AddCardPanel.tsx     # 添加卡片面板
│   │   ├── TemplateMarket.tsx   # 模板市场（首次引导）
│   │   ├── LoginPage.tsx        # 登录页
│   │   ├── Toast.tsx            # Toast 通知
│   │   └── cards/               # 7 种卡片组件
│   │       ├── ClockCard.tsx
│   │       ├── WeatherCard.tsx
│   │       ├── RssCard.tsx
│   │       ├── TodoCard.tsx
│   │       ├── NoteCard.tsx
│   │       ├── UrlCard.tsx
│   │       └── WebClipCard.tsx
├── index.html          # 入口 HTML
├── DESIGN.md           # 设计规范
├── package.json        # 依赖管理
├── tsconfig.json       # TypeScript 配置
├── tailwind.config.js  # Tailwind 配置
└── vite.config.ts      # Vite 配置
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

## 开发规范

- 使用 Tailwind CSS 进行样式开发
- 使用 CSS 变量（Design Tokens）管理主题色
- 深色模式通过 `.dark` class 切换
- 所有状态持久化到 localStorage
- 图标统一使用 lucide-react，禁止 emoji 作为功能图标
- 卡片圆角统一 6px，不使用大圆角
- 不使用霓虹色、渐变、装饰性 SVG

### 编码规范

- TypeScript `strict` 模式
- 禁止隐式 `any` 和 `as any`
- 函数参数必须有明确类型
- 清理未使用的变量和导入
