# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

雾切侦探游戏调查主界面 (Kirigiri Honkaku Project) - A mystery investigation game interface with a Gothic mystery theme.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- TailwindCSS v4
- React Router v7
- pnpm package manager

## Common Commands

```bash
# Development server (http://localhost:5173/)
pnpm dev

# Build for production
pnpm build

# Lint with ESLint
pnpm lint

# Preview production build
pnpm preview
```

## Architecture

### Routing

`App.tsx` 中使用 React Router 定义了两条核心路由：

- `/` - `HomeView`：游戏入口页，负责创建/恢复会话
- `/game?sessionId=...&playerId=...` - `InvestigationLayout`：主调查界面

### Component Organization

Components are organized by function:

- `src/components/layout/` - Layout containers (TopBar, ActionColumn, MainStage, CaseColumn, IntelBar, InvestigationLayout)
- `src/components/ui/` - Reusable UI components (InkButton, RiskIndicator, ClueCard, NPCList, ItemList, TimeDisplay, ThemeToggle)
- `src/components/views/` - View state components
  - `InvestigationView.tsx`, `DialogueView.tsx`, `FeedbackView.tsx`
  - `DetectiveBoardView.tsx` - 侦探板（Mind Place）
  - `MapView.tsx` - 地图视图
  - `PlayerProfileView.tsx` - 玩家资料与暴露追踪
  - `board/` - 侦探板专属子组件（BoardCanvas, BoardCard, BoardConnections, BoardToolbar, ContextMenu）

### Layout System

The interface uses a fixed golden ratio grid (20%/60%/20%):

```
+------------------+
|     TopBar       |  60px fixed
+--------+---------+--------+
| 20%    |  60%    | 20%    |
| Action |  Main   | Case   |
| Column |  Stage  | Column |
+--------+---------+--------+
|     IntelBar     |  50px fixed
+------------------+
```

### Styling System

Uses CSS custom properties for the "午夜酒红" (Midnight Wine) Gothic theme, defined in `src/styles/theme.css`:

- `--bg-primary: #140D12` - Main background
- `--bg-secondary: #261820` - Card/panel background
- `--bg-tertiary: #1A0F14` - Tertiary background
- `--accent-primary: #BE4BDB` - Primary accent (mysterious purple)
- `--accent-secondary: #D946EF` - Secondary accent
- `--accent-hover: #F0ABFC` - Hover accent
- `--text-primary: #F0EBE5` - Primary text
- `--text-secondary: #9CA3AF` - Secondary text
- `--text-muted: #6B7280` - Muted text
- `--border-color: #3D2829` - Default border
- `--border-hover: #5D4042` - Hovered border

Font families (imported in `src/index.css` and declared in `src/styles/fonts.css`):
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)
- Monospace: Courier Prime (for dates/typewriter text)

Themes:
- 默认深色主题通过 `:root` 定义
- 亮色主题 `"light"` 通过 `[data-theme="light"]` 定义
- `ThemeToggle` 组件负责切换 `data-theme` 属性

### Type System

Core types are distributed across several files:

**`src/types/game.ts`** - 游戏核心实体类型：
- `GameData` - 一局游戏的完整数据容器（包含 session、characters、player、npcs、locations、clues、events、dialogues 等全部实体）
- `ViewState` - 视图状态联合类型：`'investigation' | 'dialogue' | 'feedback' | 'board' | 'map' | 'profile'`
- `Session`, `Character`, `Player`, `PlayerState`, `PlayerInventory`, `PlayerKnowledge` 等玩家/NPC/地图/线索/对话体系类型
- 旧版兼容类型：`GameState`, `LocationLegacy`, `NPCLegacy`, `ItemLegacy`, `ClueLegacy`（标记为 `@deprecated`）

**`src/types/api.ts`** - 后端 API 契约类型：
- `ActionType`: `'move' | 'talk' | 'investigate' | 'gather' | 'accuse'`
- `ActionRequest` / `ActionResult` - 动作提交请求与响应
- `SceneSnapshot` / `SceneDetails` - 场景快照（驱动 UI 的核心数据结构）
- `SessionResponse` / `SessionBootstrapResponse` - 会话创建与初始化响应
- `StateDeltaSummary` - 动作执行后的状态变更摘要

**`src/types/board.ts`** - 侦探板类型：
- `DetectiveBoard`, `BoardElement`, `BoardConnection`
- `DragState`, `ConnectingState`, `ViewportState`

**`src/types/map.ts`** - 地图类型：
- `GameMap`, `MapNode`, `MapConnection`, `MapViewState`
- `NodeStatus`: `'unexplored' | 'visited' | 'current'`

### State Management

游戏状态通过 **`useGameSession` hook** (`src/hooks/useGameSession.ts`) 统一管理：

- 封装了 `createSession`、`bootstrapSession`、`submitAction` 等 API 调用
- 维护 `sessionId`、`playerId`、`scene`（`SceneSnapshot`）、`narrativeText`、`discoveredClues`、`visitedLocations` 等状态
- 暴露便捷方法：`startGame()`、`resumeGame(sessionId, playerId)`、`move()`、`talk()`、`investigate()`、`gather()`、`accuse()`

`InvestigationLayout` 作为状态消费者，从 `useGameSession` 获取 `scene` 和 `details`，通过 props 向下分发给各 layout 组件与 view 组件。

### API Layer

`src/api/client.ts` 使用原生 `fetch` 封装了后端交互：

- `createSession()` - POST `/api/v1/sessions`（空请求体，AGENT 生成世界）
- `getSession(sessionId)` - GET 会话元数据
- `bootstrapSession(sessionId)` - POST 初始化世界
- `submitAction(req)` - POST `/api/v1/actions` 提交玩家动作

API 基础地址通过环境变量 `VITE_API_BASE_URL` 配置，异常通过 `ApiError` 抛出。

### Mock Data

开发辅助 mock 数据：
- `src/data/mock.ts` - 旧版 `mockGameState` 兼容数据
- `src/data/mapMock.ts` - 地图视图专用的 `mockMapData`

### Key Patterns

### TailwindCSS v4 Syntax

使用 TailwindCSS v4 推荐的简写语法引用 CSS 变量：

- `bg-(--bg-secondary)` ✓ （推荐）
- ~~`bg-[var(--bg-secondary)]`~~ ✗ （避免）

同理适用于其他工具类：
- `text-(--text-primary)`、`border-(--border-color)`
- `shrink-0` ✓ （推荐）
- ~~`flex-shrink-0`~~ ✗ （避免）

### 其他模式

- Animation classes are defined in `src/styles/animations.css`
- Flip cards use the `.flip-card` utility classes with 3D transforms
- Risk indicator uses SVG with stroke-dashoffset for crack animation
- 侦探板样式集中在 `src/styles/board.css`
