# DESIGN.md — CANEL

## 气质与意象

清晨的 Architect 工作室：白墙、浅灰桌面、一盏可调角度的金属台灯。没有装饰画，没有绿植——所有注意力集中在图纸上。

关键词：克制、精密、排版驱动、信息密度适中。

## 视觉策略

- 无装饰图形。所有视觉元素均来自文字排版、边框、间距。
- 图标统一使用 lucide-react（线性、1.5px stroke、16-20px）。
- 不使用 emoji 作为功能图标。
- 不使用渐变、霓虹色、大面积色块。
- 不使用大圆角（>6px）。

## 配色方案

| Token | Light | Dark | 意象 |
|-------|-------|------|------|
| `--bg-canvas` | #FAFAFA | #09090B | 未漂白的纸 |
| `--bg-surface` | #FFFFFF | #111113 | 桌面 |
| `--bg-elevated` | #FFFFFF | #18181B | 悬浮面板 |
| `--border-line` | #E4E4E7 | #27272A | 铅笔线 |
| `--border-dashed` | #D4D4D8 | #3F3F46 | 草稿线 |
| `--text-primary` | #18181B | #FAFAFA | 墨 |
| `--text-secondary` | #71717A | #A1A1AA | 石墨 |
| `--text-tertiary` | #A1A1AA | #71717A | 水渍 |
| `--accent` | #5B6CFF | #7B8AFF | 极小面积强调（仅 Tab 指示器、链接、激活态） |

### 禁忌
- 不使用霓虹色（#FF00FF、#00FF88 等）
- 不使用渐变背景
- 不使用大面积主色填充
- 不使用彩色阴影

## 字体排版

- 英文：Inter（400/500/600）
- 中文：PingFang SC / 系统默认
- 层级：24/600 → 18/600 → 14/600 → 13/400 → 12/400
- 排版是核心视觉手段，字重和字号的层级比颜色更重要

## 卡片规范

- 圆角：**6px**（微圆角，非大圆角）
- 边框：1px solid var(--border-line)
- 阴影：极轻（0 1px 2px rgba(0,0,0,0.04)），hover 微增
- hover：border-color 变为 var(--accent) 的 20% 透明度
- 无彩色阴影、无霓虹发光

## 动效

- 缓动曲线：cubic-bezier(0.16, 1, 0.3, 1)
- 快速 150ms / 标准 300ms / 慢速 500ms
- 情境切换：200ms fade out → 300ms fade in + translateY(4px→0)
- 卡片 stagger：每个延迟 30ms
- 拖拽：scale 1.02 + 阴影加深（无霓虹）

## 设计禁忌（Do Not）

- ❌ 大圆角（>6px）
- ❌ Emoji 作为功能图标
- ❌ 霓虹色 / 渐变 / 彩色阴影
- ❌ 装饰性 SVG 图形
- ❌ 大面积主色填充
- ❌ 过度动画（弹跳、旋转、闪烁）
- ❌ 彩色背景卡片
- ❌ 毛玻璃效果（backdrop-blur 仅用于极轻量的浮动面板）
