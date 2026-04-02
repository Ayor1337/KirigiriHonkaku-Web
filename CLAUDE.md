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

### Component Organization

Components are organized by function:

- `src/components/layout/` - Layout containers (TopBar, ActionColumn, MainStage, CaseColumn, IntelBar, InvestigationLayout)
- `src/components/ui/` - Reusable UI components (InkButton, RiskIndicator, ClueCard, NPCList, ItemList, TimeDisplay)
- `src/components/views/` - View state components (InvestigationView, DialogueView, FeedbackView)

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

Uses CSS custom properties for the "午夜酒红" (Midnight Wine) Gothic theme:

- `--bg-primary: #140D12` - Main background
- `--bg-secondary: #261820` - Card/panel background
- `--accent-primary: #BE4BDB` - Primary accent (mysterious purple)
- `--text-primary: #F0EBE5` - Primary text
- `--text-secondary: #9CA3AF` - Secondary text

Font families:
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)
- Monospace: Courier Prime (for dates/typewriter text)

### Type System

Core types in `src/types/game.ts`:

- `GameState` - Central game state container
- `ViewState` - Union type: 'investigation' | 'dialogue' | 'feedback'
- `NPC`, `Item`, `Clue`, `Location` - Entity types

### State Management

Uses React useState with props drilling through the component tree. State is managed in `InvestigationLayout` and passed down to children via props.

### Mock Data

Development uses mock data from `src/data/mock.ts` with the `mockGameState` object.

## Key Patterns

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
