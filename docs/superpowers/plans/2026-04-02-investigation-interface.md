# 调查主界面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现雾切侦探游戏调查主界面，采用哥特神秘风格，黄金比例四区布局

**架构：** 使用 React + TypeScript + TailwindCSS v4，CSS Grid 固定比例布局（20/60/20），组件按功能区域组织，状态管理使用 React useState

**Tech Stack:** React 19, TypeScript, TailwindCSS v4, React Router v7

---

## 文件结构

```
src/
├── components/
│   ├── layout/
│   │   ├── InvestigationLayout.tsx    # 主布局容器
│   │   ├── TopBar.tsx                 # 顶部信息栏
│   │   ├── ActionColumn.tsx           # 左侧行动列
│   │   ├── MainStage.tsx              # 中央主舞台
│   │   ├── CaseColumn.tsx             # 右侧案情列
│   │   └── IntelBar.tsx               # 底部情报带
│   ├── ui/
│   │   ├── LocationCard.tsx           # 地点卡片
│   │   ├── NPCList.tsx                # NPC列表
│   │   ├── ItemList.tsx               # 物品列表
│   │   ├── ClueCard.tsx               # 线索卡（可翻转）
│   │   ├── RiskIndicator.tsx          # 风险指示器
│   │   ├── TimeDisplay.tsx            # 时间显示
│   │   └── InkButton.tsx              # 墨水扩散按钮
│   └── views/
│       ├── InvestigationView.tsx      # 默认调查态
│       ├── DialogueView.tsx           # 对话进行态
│       └── FeedbackView.tsx           # 调查反馈态
├── styles/
│   ├── fonts.css                      # 字体导入
│   ├── theme.css                      # CSS变量主题色
│   └── animations.css                 # 自定义动画
├── types/
│   └── game.ts                        # 游戏类型定义
├── data/
│   └── mock.ts                        # 模拟数据
└── App.tsx                            # 主应用入口
```

---

## Task 1: 基础样式配置

**Files:**
- Create: `src/styles/fonts.css`
- Create: `src/styles/theme.css`
- Create: `src/styles/animations.css`
- Modify: `src/index.css`

### Step 1: 创建字体配置

```css
/* src/styles/fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&family=Courier+Prime&display=swap');

.font-heading {
  font-family: 'Playfair Display', serif;
}

.font-body {
  font-family: 'Inter', sans-serif;
}

.font-mono {
  font-family: 'Courier Prime', monospace;
}
```

### Step 2: 创建主题CSS变量

```css
/* src/styles/theme.css */
:root {
  /* 午夜酒红主题 */
  --bg-primary: #140D12;
  --bg-secondary: #261820;
  --bg-tertiary: #1A0F14;
  
  --accent-primary: #BE4BDB;
  --accent-secondary: #D946EF;
  --accent-hover: #F0ABFC;
  
  --text-primary: #F0EBE5;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;
  
  --border-color: #3D2829;
  --border-hover: #5D4042;
  
  --danger: #DC2626;
  --warning: #F59E0B;
  --success: #10B981;
}
```

### Step 3: 创建动画效果

```css
/* src/styles/animations.css */
/* 墨水扩散效果 */
@keyframes ink-spread {
  from {
    transform: scale(0);
    opacity: 0.8;
  }
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* 脉冲效果 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(190, 75, 219, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(190, 75, 219, 0);
  }
}

/* 裂纹蔓延 - 基础 */
@keyframes crack-appear {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* 卡片翻转 */
.flip-card {
  perspective: 1000px;
}

.flip-card-inner {
  transition: transform 0.5s ease-in-out;
  transform-style: preserve-3d;
}

.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

### Step 4: 更新主样式文件

```css
/* src/index.css */
@import "tailwindcss";
@import "./styles/fonts.css";
@import "./styles/theme.css";
@import "./styles/animations.css";

/* 基础样式 */
html {
  font-size: 16px;
  line-height: 1.7;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

/* 选中文字样式 */
::selection {
  background-color: rgba(190, 75, 219, 0.3);
  color: var(--text-primary);
}
```

### Step 5: Commit

```bash
git add src/styles/ src/index.css
git commit -m "feat: add base styles, fonts, theme colors and animations"
```

---

## Task 2: 类型定义

**Files:**
- Create: `src/types/game.ts`

### Step 1: 创建游戏类型定义

```typescript
// src/types/game.ts

export interface Location {
  id: string;
  name: string;
  description: string;
  weather: string;
  timeOfDay: string;
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  isPresent: boolean;
  dialogueAvailable: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isInvestigated: boolean;
}

export interface Clue {
  id: string;
  title: string;
  summary: string;
  details: string;
  relatedClues: string[];
  discoveredAt: Date;
}

export interface GameState {
  currentLocation: Location;
  currentTime: Date;
  timePeriod: string;
  weather: string;
  exposureLevel: number; // 0-100
  availableLocations: Location[];
  presentNPCs: NPC[];
  availableItems: Item[];
  discoveredClues: Clue[];
  recentEvents: string[];
  situation: string;
}

export type ViewState = 'investigation' | 'dialogue' | 'feedback';

export interface DialogueOption {
  id: string;
  text: string;
  npcId: string;
  timeCost: number;
}

export interface InvestigationResult {
  itemId: string;
  description: string;
  cluesFound: Clue[];
  timeAdvanced: number;
  newLocations?: Location[];
  newNPCs?: NPC[];
  exposureChange: number;
}
```

### Step 2: Commit

```bash
git add src/types/game.ts
git commit -m "feat: add game type definitions"
```

---

## Task 3: 模拟数据

**Files:**
- Create: `src/data/mock.ts`

### Step 1: 创建模拟数据

```typescript
// src/data/mock.ts
import type { GameState, Location, NPC, Item, Clue } from '../types/game';

export const mockLocation: Location = {
  id: 'loc-1',
  name: '维多利亚酒店大堂',
  description: '水晶吊灯投下昏黄的光，空气中弥漫着雪茄和威士忌的气息。大理石地面映出模糊的人影，角落里一架钢琴静默地立着。雨夜的客人三三两两散落在皮质沙发间，低声交谈。',
  weather: '雨',
  timeOfDay: '傍晚',
};

export const mockNPCs: NPC[] = [
  {
    id: 'npc-1',
    name: '亚瑟·布莱克伍德',
    title: '酒店经理',
    isPresent: true,
    dialogueAvailable: true,
  },
  {
    id: 'npc-2',
    name: '伊莎贝拉·陈',
    title: '钢琴师',
    isPresent: true,
    dialogueAvailable: true,
  },
  {
    id: 'npc-3',
    name: '托马斯·格雷',
    title: '神秘客人',
    isPresent: true,
    dialogueAvailable: false,
  },
];

export const mockItems: Item[] = [
  {
    id: 'item-1',
    name: '遗留的手提箱',
    description: '一个磨损的棕色皮箱，锁扣已经损坏。',
    isInvestigated: false,
  },
  {
    id: 'item-2',
    name: '钢琴上的乐谱',
    description: '几张泛黄的乐谱，上面有些奇怪的记号。',
    isInvestigated: false,
  },
  {
    id: 'item-3',
    name: '登记簿',
    description: '酒店的入住登记记录。',
    isInvestigated: true,
  },
];

export const mockClues: Clue[] = [
  {
    id: 'clue-1',
    title: '奇怪的登记记录',
    summary: '昨晚有一位未留下姓名的客人入住302房间。',
    details: '登记簿显示302房间在昨晚被预订，但名字栏只画了一个符号——一个倒五角星。前台说客人穿着黑色斗篷，全程低着头。',
    relatedClues: [],
    discoveredAt: new Date('1924-10-15T18:00:00'),
  },
  {
    id: 'clue-2',
    title: '破损的怀表',
    summary: '在走廊发现一只停在11点47分的怀表。',
    details: '表盖内侧刻着"献给M"，表面有轻微划痕，似乎曾被摔落。这很可能是案件发生时刻的关键证据。',
    relatedClues: ['clue-1'],
    discoveredAt: new Date('1924-10-15T18:30:00'),
  },
];

export const mockGameState: GameState = {
  currentLocation: mockLocation,
  currentTime: new Date('1924-10-15T19:00:00'),
  timePeriod: '傍晚',
  weather: '雨',
  exposureLevel: 25,
  availableLocations: [
    { id: 'loc-1', name: '维多利亚酒店大堂', description: '', weather: '', timeOfDay: '' },
    { id: 'loc-2', name: '302号房间', description: '', weather: '', timeOfDay: '' },
    { id: 'loc-3', name: '酒店酒吧', description: '', weather: '', timeOfDay: '' },
  ],
  presentNPCs: mockNPCs,
  availableItems: mockItems,
  discoveredClues: mockClues,
  recentEvents: ['进入酒店大堂', '发现破碎的怀表', '与经理简短交谈'],
  situation: '雨夜中的酒店弥漫着不安的气息，有人在暗中观察你的行动。',
};
```

### Step 2: Commit

```bash
git add src/data/mock.ts
git commit -m "feat: add mock data for development"
```

---

## Task 4: 墨水按钮组件

**Files:**
- Create: `src/components/ui/InkButton.tsx`

### Step 1: 创建墨水扩散按钮

```tsx
// src/components/ui/InkButton.tsx
import { useRef, type ButtonHTMLAttributes } from 'react';

interface InkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function InkButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: InkButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseStyles = 'relative overflow-hidden font-medium transition-colors duration-200';
  
  const variantStyles = {
    default: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
    danger: 'bg-[var(--bg-secondary)] text-[var(--danger)] border border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-base rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      buttonRef.current.style.setProperty('--ink-opacity', '1');
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} group`}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {/* 墨水扩散背景 */}
      <span 
        className="absolute inset-0 bg-[var(--accent-primary)] opacity-0 transition-opacity duration-300 group-hover:opacity-10"
        style={{
          transform: 'scale(0)',
          borderRadius: '50%',
          transition: 'transform 0.5s ease-out, opacity 0.3s ease',
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
```

### Step 2: Commit

```bash
git add src/components/ui/InkButton.tsx
git commit -m "feat: add InkButton component with ink spread hover effect"
```

---

## Task 5: 风险指示器组件

**Files:**
- Create: `src/components/ui/RiskIndicator.tsx`

### Step 1: 创建裂纹风险指示器

```tsx
// src/components/ui/RiskIndicator.tsx
interface RiskIndicatorProps {
  level: number; // 0-100
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
  const getCrackOpacity = () => {
    if (level < 25) return 0.2;
    if (level < 50) return 0.5;
    if (level < 75) return 0.8;
    return 1;
  };

  const getColor = () => {
    if (level < 25) return '#9CA3AF';
    if (level < 50) return '#F59E0B';
    if (level < 75) return '#DC2626';
    return '#991B1B';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        {/* 基础圆形 */}
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* 外圈 */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="2"
          />
          
          {/* 裂纹 - 根据风险值显示 */}
          <g 
            opacity={getCrackOpacity()}
            stroke={getColor()}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          >
            {/* 裂纹1 - 从左上 */}
            <path 
              d="M8 12 L15 18 L12 25"
              strokeDasharray="30"
              strokeDashoffset={level > 10 ? 0 : 30}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            {/* 裂纹2 - 从右上 */}
            <path 
              d="M40 10 L35 16 L38 22"
              strokeDasharray="25"
              strokeDashoffset={level > 30 ? 0 : 25}
              style={{ transition: 'stroke-dashoffset 0.5s ease 0.1s' }}
            />
            {/* 裂纹3 - 从下方 */}
            <path 
              d="M24 44 L22 35 L28 30"
              strokeDasharray="20"
              strokeDashoffset={level > 50 ? 0 : 20}
              style={{ transition: 'stroke-dashoffset 0.5s ease 0.2s' }}
            />
            {/* 裂纹4 - 危险时 */}
            {level >= 75 && (
              <path 
                d="M15 35 L20 28 L18 22 L24 24"
                strokeWidth="2"
                style={{ animation: 'crack-appear 0.3s ease forwards' }}
              />
            )}
          </g>
          
          {/* 中心核心 */}
          <circle
            cx="24"
            cy="24"
            r={6 + (level / 100) * 4}
            fill={getColor()}
            opacity={0.3 + (level / 100) * 0.5}
            style={{ transition: 'all 0.3s ease' }}
          />
        </svg>
      </div>
      
      {/* 数值显示 */}
      <div className="flex flex-col">
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
          暴露度
        </span>
        <span 
          className="font-mono text-lg font-bold"
          style={{ color: getColor() }}
        >
          {level}%
        </span>
      </div>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/ui/RiskIndicator.tsx
git commit -m "feat: add RiskIndicator with crack spread visualization"
```

---

## Task 6: 线索卡组件

**Files:**
- Create: `src/components/ui/ClueCard.tsx`

### Step 1: 创建可翻转线索卡

```tsx
// src/components/ui/ClueCard.tsx
import { useState } from 'react';
import type { Clue } from '../../types/game';

interface ClueCardProps {
  clue: Clue;
  isNew?: boolean;
}

export function ClueCard({ clue, isNew = false }: ClueCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`flip-card w-full h-40 cursor-pointer ${isNew ? 'animate-[pulse-glow_0.6s_ease-in-out_2]' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`flip-card-inner relative w-full h-full ${isFlipped ? 'flipped' : ''}`}>
        {/* 正面 */}
        <div className="flip-card-front absolute inset-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-heading text-lg text-[var(--accent-primary)]">
              {clue.title}
            </h4>
            {isNew && (
              <span className="px-2 py-0.5 text-xs bg-[var(--accent-primary)] text-white rounded">
                新
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] flex-1">
            {clue.summary}
          </p>
          <div className="text-xs text-[var(--text-muted)] mt-2">
            点击翻转查看详情 →
          </div>
        </div>

        {/* 背面 */}
        <div className="flip-card-back absolute inset-0 bg-[var(--bg-tertiary)] border border-[var(--accent-primary)] rounded-lg p-4 flex flex-col">
          <h4 className="font-heading text-base text-[var(--accent-primary)] mb-2">
            {clue.title}
          </h4>
          <p className="text-sm text-[var(--text-primary)] flex-1 overflow-y-auto">
            {clue.details}
          </p>
          {clue.relatedClues.length > 0 && (
            <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
              <span className="text-xs text-[var(--text-muted)]">
                关联线索: {clue.relatedClues.length} 条
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/ui/ClueCard.tsx
git commit -m "feat: add ClueCard with 3D flip animation"
```

---

## Task 7: NPC列表组件

**Files:**
- Create: `src/components/ui/NPCList.tsx`

### Step 1: 创建NPC列表

```tsx
// src/components/ui/NPCList.tsx
import type { NPC } from '../../types/game';
import { InkButton } from './InkButton';

interface NPCListProps {
  npcs: NPC[];
  onSelectNPC: (npc: NPC) => void;
  activeNPCId?: string;
}

export function NPCList({ npcs, onSelectNPC, activeNPCId }: NPCListProps) {
  return (
    <div className="space-y-2">
      {npcs.map((npc) => (
        <div
          key={npc.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
            activeNPCId === npc.id
              ? 'bg-[var(--bg-tertiary)] border-[var(--accent-primary)]'
              : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)]'
          }`}
          onClick={() => onSelectNPC(npc)}
        >
          {/* 剪影头像 */}
          <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6 text-[var(--text-muted)]"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[var(--text-primary)] truncate">
              {npc.name}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {npc.title}
            </div>
          </div>
          
          {!npc.dialogueAvailable && (
            <span className="text-xs text-[var(--text-muted)] px-2 py-0.5 bg-[var(--bg-primary)] rounded">
              沉默
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/ui/NPCList.tsx
git commit -m "feat: add NPCList with silhouette avatars"
```

---

## Task 8: 物品列表组件

**Files:**
- Create: `src/components/ui/ItemList.tsx`

### Step 1: 创建物品列表

```tsx
// src/components/ui/ItemList.tsx
import type { Item } from '../../types/game';

interface ItemListProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
}

export function ItemList({ items, onSelectItem }: ItemListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
            item.isInvestigated
              ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] opacity-70'
              : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
          }`}
          onClick={() => onSelectItem(item)}
        >
          {/* 物品图标 */}
          <div className="w-10 h-10 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={`font-medium truncate ${
              item.isInvestigated ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
            }`}>
              {item.name}
            </div>
            <div className="text-xs text-[var(--text-muted)] truncate">
              {item.description}
            </div>
          </div>
          
          {item.isInvestigated && (
            <span className="text-xs text-[var(--success)] px-2 py-0.5 bg-[var(--bg-primary)] rounded">
              已调查
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/ui/ItemList.tsx
git commit -m "feat: add ItemList component"
```

---

## Task 9: 时间显示组件

**Files:**
- Create: `src/components/ui/TimeDisplay.tsx`

### Step 1: 创建打字机风格时间显示

```tsx
// src/components/ui/TimeDisplay.tsx
interface TimeDisplayProps {
  date: Date;
  timePeriod: string;
  weather: string;
}

export function TimeDisplay({ date, timePeriod, weather }: TimeDisplayProps) {
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const formatTime = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col">
      <div className="font-mono text-lg text-[var(--text-primary)] tracking-wider">
        {formatDate(date)}
      </div>
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <span>{formatTime(date)}</span>
        <span className="text-[var(--border-color)]">|</span>
        <span>{timePeriod}</span>
        <span className="text-[var(--border-color)]">|</span>
        <span>{weather}</span>
      </div>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/ui/TimeDisplay.tsx
git commit -m "feat: add TimeDisplay with typewriter style"
```

---

## Task 10: 顶部栏布局组件

**Files:**
- Create: `src/components/layout/TopBar.tsx`

### Step 1: 创建顶部信息栏

```tsx
// src/components/layout/TopBar.tsx
import { TimeDisplay } from '../ui/TimeDisplay';
import { RiskIndicator } from '../ui/RiskIndicator';
import type { GameState } from '../../types/game';

interface TopBarProps {
  gameState: GameState;
}

export function TopBar({ gameState }: TopBarProps) {
  return (
    <header className="h-[60px] bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-6 flex items-center justify-between flex-shrink-0">
      {/* 左侧：时间 */}
      <TimeDisplay 
        date={gameState.currentTime}
        timePeriod={gameState.timePeriod}
        weather={gameState.weather}
      />
      
      {/* 中间：局势提示 */}
      <div className="hidden md:flex items-center max-w-md px-6">
        <span className="text-sm text-[var(--text-secondary)] text-center line-clamp-1">
          {gameState.situation}
        </span>
      </div>
      
      {/* 右侧：风险指示器 */}
      <RiskIndicator level={gameState.exposureLevel} />
    </header>
  );
}
```

### Step 2: Commit

```bash
git add src/components/layout/TopBar.tsx
git commit -m "feat: add TopBar layout component"
```

---

## Task 11: 左侧行动列

**Files:**
- Create: `src/components/layout/ActionColumn.tsx`

### Step 1: 创建左侧行动列

```tsx
// src/components/layout/ActionColumn.tsx
import { NPCList } from '../ui/NPCList';
import { ItemList } from '../ui/ItemList';
import { InkButton } from '../ui/InkButton';
import type { GameState, Location, NPC, Item } from '../../types/game';

interface ActionColumnProps {
  gameState: GameState;
  onSelectLocation: (location: Location) => void;
  onSelectNPC: (npc: NPC) => void;
  onSelectItem: (item: Item) => void;
  activeNPCId?: string;
}

export function ActionColumn({
  gameState,
  onSelectLocation,
  onSelectNPC,
  onSelectItem,
  activeNPCId,
}: ActionColumnProps) {
  return (
    <aside className="h-full bg-[var(--bg-primary)] border-r border-[var(--border-color)] overflow-y-auto p-4 space-y-6">
      {/* 当前地点卡 */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          当前地点
        </h3>
        <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
          <h4 className="font-heading text-base text-[var(--text-primary)] mb-1">
            {gameState.currentLocation.name}
          </h4>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
            {gameState.currentLocation.description.slice(0, 60)}...
          </p>
        </div>
      </section>

      {/* 可前往地点 */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          前往地点
        </h3>
        <div className="space-y-2">
          {gameState.availableLocations.map((location) => (
            <InkButton
              key={location.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => onSelectLocation(location)}
            >
              <span className="truncate">{location.name}</span>
            </InkButton>
          ))}
        </div>
      </section>

      {/* 可询问NPC */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          询问对象
        </h3>
        <NPCList
          npcs={gameState.presentNPCs}
          onSelectNPC={onSelectNPC}
          activeNPCId={activeNPCId}
        />
      </section>

      {/* 可调查物品 */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          调查物品
        </h3>
        <ItemList
          items={gameState.availableItems}
          onSelectItem={onSelectItem}
        />
      </section>
    </aside>
  );
}
```

### Step 2: Commit

```bash
git add src/components/layout/ActionColumn.tsx
git commit -m "feat: add ActionColumn layout component"
```

---

## Task 12: 右侧案情列

**Files:**
- Create: `src/components/layout/CaseColumn.tsx`

### Step 1: 创建右侧案情列

```tsx
// src/components/layout/CaseColumn.tsx
import { ClueCard } from '../ui/ClueCard';
import type { GameState, NPC } from '../../types/game';

interface CaseColumnProps {
  gameState: GameState;
  onSelectNPC: (npc: NPC) => void;
  newClueIds?: string[];
}

export function CaseColumn({ gameState, onSelectNPC, newClueIds = [] }: CaseColumnProps) {
  return (
    <aside className="h-full bg-[var(--bg-primary)] border-l border-[var(--border-color)] overflow-y-auto p-4 space-y-6">
      {/* 在场NPC */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          在场人物
        </h3>
        <div className="flex flex-wrap gap-2">
          {gameState.presentNPCs.filter(n => n.isPresent).map((npc) => (
            <button
              key={npc.id}
              onClick={() => onSelectNPC(npc)}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-primary)] transition-colors"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-4 h-4 text-[var(--text-muted)]"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span className="text-sm text-[var(--text-primary)]">{npc.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 最新线索 */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          最新线索
        </h3>
        <div className="space-y-3">
          {gameState.discoveredClues.slice(0, 3).map((clue) => (
            <ClueCard 
              key={clue.id} 
              clue={clue} 
              isNew={newClueIds.includes(clue.id)}
            />
          ))}
          {gameState.discoveredClues.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic">
              尚未发现任何线索...
            </p>
          )}
        </div>
      </section>

      {/* 最近事件 */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          最近事件
        </h3>
        <div className="space-y-2">
          {gameState.recentEvents.slice(-5).map((event, index) => (
            <div 
              key={index}
              className="text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[var(--border-color)]"
            >
              {event}
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
```

### Step 2: Commit

```bash
git add src/components/layout/CaseColumn.tsx
git commit -m "feat: add CaseColumn layout component"
```

---

## Task 13: 底部情报带

**Files:**
- Create: `src/components/layout/IntelBar.tsx`

### Step 1: 创建底部情报带

```tsx
// src/components/layout/IntelBar.tsx
import { InkButton } from '../ui/InkButton';

interface IntelBarProps {
  unreadClues?: number;
  mapPoints?: number;
  connectableClues?: number;
}

export function IntelBar({ 
  unreadClues = 0, 
  mapPoints = 0,
  connectableClues = 0,
}: IntelBarProps) {
  const navItems = [
    { id: 'map', label: '地图', icon: '🗺️', badge: mapPoints > 0 ? mapPoints : undefined },
    { id: 'clues', label: '线索册', icon: '📋', badge: unreadClues > 0 ? unreadClues : undefined },
    { id: 'board', label: '侦探板', icon: '🧩', badge: connectableClues > 0 ? connectableClues : undefined },
    { id: 'records', label: '对话记录', icon: '📝' },
  ];

  return (
    <nav className="h-[50px] bg-[var(--bg-secondary)] border-t border-[var(--border-color)] px-6 flex items-center justify-center gap-4 flex-shrink-0">
      {navItems.map((item) => (
        <button
          key={item.id}
          className="relative flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-md hover:bg-[var(--bg-tertiary)]"
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
          {item.badge !== undefined && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-[var(--accent-primary)] text-white rounded-full">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
```

### Step 2: Commit

```bash
git add src/components/layout/IntelBar.tsx
git commit -m "feat: add IntelBar layout component"
```

---

## Task 14: 默认调查视图

**Files:**
- Create: `src/components/views/InvestigationView.tsx`

### Step 1: 创建默认调查态视图

```tsx
// src/components/views/InvestigationView.tsx
import type { GameState, Item, NPC } from '../../types/game';
import { InkButton } from '../ui/InkButton';

interface InvestigationViewProps {
  gameState: GameState;
  onSelectNPC: (npc: NPC) => void;
  onSelectItem: (item: Item) => void;
}

export function InvestigationView({ 
  gameState, 
  onSelectNPC, 
  onSelectItem,
}: InvestigationViewProps) {
  const uninvestigatedItems = gameState.availableItems.filter(i => !i.isInvestigated);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* 地点标题 */}
      <header>
        <h1 className="font-heading text-3xl text-[var(--text-primary)] mb-2">
          {gameState.currentLocation.name}
        </h1>
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <span>{gameState.timePeriod}</span>
          <span className="text-[var(--border-color)]">·</span>
          <span>{gameState.weather}</span>
        </div>
      </header>

      {/* 场景描述 */}
      <section className="prose prose-invert max-w-none">
        <p className="text-lg text-[var(--text-primary)] leading-relaxed">
          {gameState.currentLocation.description}
        </p>
      </section>

      {/* 在场人物摘要 */}
      {gameState.presentNPCs.length > 0 && (
        <section>
          <h2 className="font-heading text-xl text-[var(--accent-primary)] mb-4">
            在场人物
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gameState.presentNPCs.map((npc) => (
              <div
                key={npc.id}
                onClick={() => onSelectNPC(npc)}
                className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[var(--text-muted)]" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{npc.name}</div>
                  <div className="text-sm text-[var(--text-muted)]">{npc.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 可调查物品摘要 */}
      {uninvestigatedItems.length > 0 && (
        <section>
          <h2 className="font-heading text-xl text-[var(--accent-primary)] mb-4">
            值得关注的物品
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uninvestigatedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 局势提示 */}
      <section className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
          当前局势
        </h3>
        <p className="text-[var(--text-primary)]">
          {gameState.situation}
        </p>
      </section>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/views/InvestigationView.tsx
git commit -m "feat: add InvestigationView for default state"
```

---

## Task 15: 对话视图

**Files:**
- Create: `src/components/views/DialogueView.tsx`

### Step 1: 创建对话进行态视图

```tsx
// src/components/views/DialogueView.tsx
import { useState } from 'react';
import { InkButton } from '../ui/InkButton';
import type { NPC } from '../../types/game';

interface DialogueOption {
  id: string;
  text: string;
  response: string;
}

interface DialogueViewProps {
  npc: NPC;
  onBack: () => void;
}

const mockDialogueOptions: DialogueOption[] = [
  { id: '1', text: '你昨晚看到了什么？', response: '我...我不能说。那个人警告过我。' },
  { id: '2', text: '你认识受害者吗？', response: '只见过几次。他总是独来独往。' },
  { id: '3', text: '这里的钢琴是你的吗？', response: '是的，我每晚都在这里演奏。直到那晚...' },
];

export function DialogueView({ npc, onBack }: DialogueViewProps) {
  const [dialogue, setDialogue] = useState<string[]>([
    `${npc.name}看着你，眼神中带着警惕。`,
  ]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSelectOption = (option: DialogueOption) => {
    if (selectedOptions.includes(option.id)) return;
    
    setDialogue(prev => [
      ...prev,
      `你问："${option.text}"`,
      `${npc.name}回答："${option.response}"`,
    ]);
    setSelectedOptions(prev => [...prev, option.id]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 对话头部 */}
      <header className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[var(--text-muted)]" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-heading text-2xl text-[var(--text-primary)]">{npc.name}</h2>
            <span className="text-sm text-[var(--text-muted)]">{npc.title}</span>
          </div>
        </div>
        <InkButton variant="ghost" size="sm" onClick={onBack}>
          ← 返回调查
        </InkButton>
      </header>

      {/* 对话内容区 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {dialogue.map((line, index) => {
          const isPlayer = line.startsWith('你问：');
          return (
            <div 
              key={index}
              className={`flex ${isPlayer ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-lg ${
                  isPlayer 
                    ? 'bg-[var(--accent-primary)] text-white' 
                    : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                }`}
              >
                <p className="leading-relaxed">{line.replace(/^(你问：|.+回答：)/, '')}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 话题选项 */}
      <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          可追问的话题
        </h3>
        <div className="flex flex-wrap gap-2">
          {mockDialogueOptions.map((option) => (
            <InkButton
              key={option.id}
              variant={selectedOptions.includes(option.id) ? 'ghost' : 'default'}
              size="sm"
              onClick={() => handleSelectOption(option)}
            >
              {option.text}
              {selectedOptions.includes(option.id) && ' ✓'}
            </InkButton>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/views/DialogueView.tsx
git commit -m "feat: add DialogueView for conversation state"
```

---

## Task 16: 调查反馈视图

**Files:**
- Create: `src/components/views/FeedbackView.tsx`

### Step 1: 创建调查反馈态视图

```tsx
// src/components/views/FeedbackView.tsx
import { useEffect, useState } from 'react';
import { ClueCard } from '../ui/ClueCard';
import { InkButton } from '../ui/InkButton';
import type { Item, Clue, Location, NPC } from '../../types/game';

interface FeedbackViewProps {
  item: Item;
  result: {
    description: string;
    cluesFound: Clue[];
    timeAdvanced: number;
    newLocations?: Location[];
    newNPCs?: NPC[];
    exposureChange: number;
  };
  onComplete: () => void;
}

export function FeedbackView({ item, result, onComplete }: FeedbackViewProps) {
  const [showClues, setShowClues] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowClues(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* 标题 */}
      <header>
        <h2 className="text-sm text-[var(--text-muted)] uppercase tracking-wider mb-2">
          调查结果
        </h2>
        <h1 className="font-heading text-2xl text-[var(--text-primary)]">
          {item.name}
        </h1>
      </header>

      {/* 调查结果描述 */}
      <section className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
        <p className="text-lg text-[var(--text-primary)] leading-relaxed">
          {result.description}
        </p>
      </section>

      {/* 发现的线索 */}
      {result.cluesFound.length > 0 && (
        <section>
          <h3 className="font-heading text-xl text-[var(--accent-primary)] mb-4 flex items-center gap-2">
            <span>发现的线索</span>
            <span className="text-sm px-2 py-0.5 bg-[var(--accent-primary)] text-white rounded">
              {result.cluesFound.length}
            </span>
          </h3>
          <div className="space-y-3">
            {result.cluesFound.map((clue, index) => (
              <div 
                key={clue.id}
                style={{ 
                  opacity: showClues ? 1 : 0,
                  transform: showClues ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease ${index * 0.2}s`,
                }}
              >
                <ClueCard clue={clue} isNew={true} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 状态变化 */}
      <section className="space-y-3">
        <h3 className="font-heading text-lg text-[var(--text-primary)]">
          状态变化
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 时间推进 */}
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
            <div className="text-sm text-[var(--text-muted)] mb-1">时间推进</div>
            <div className="font-mono text-lg text-[var(--text-primary)]">
              +{result.timeAdvanced} 分钟
            </div>
          </div>

          {/* 暴露度变化 */}
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
            <div className="text-sm text-[var(--text-muted)] mb-1">暴露度变化</div>
            <div className={`font-mono text-lg ${
              result.exposureChange > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'
            }`}>
              {result.exposureChange > 0 ? '+' : ''}{result.exposureChange}%
            </div>
          </div>
        </div>

        {/* 解锁内容 */}
        {result.newLocations && result.newLocations.length > 0 && (
          <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--accent-primary)] rounded-lg">
            <div className="text-sm text-[var(--accent-primary)] mb-2">解锁新地点</div>
            <div className="flex flex-wrap gap-2">
              {result.newLocations.map(loc => (
                <span key={loc.id} className="text-[var(--text-primary)]">{loc.name}</span>
              ))}
            </div>
          </div>
        )}

        {result.newNPCs && result.newNPCs.length > 0 && (
          <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--accent-primary)] rounded-lg">
            <div className="text-sm text-[var(--accent-primary)] mb-2">新增可询问对象</div>
            <div className="flex flex-wrap gap-2">
              {result.newNPCs.map(npc => (
                <span key={npc.id} className="text-[var(--text-primary)]">{npc.name}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 完成按钮 */}
      <div className="pt-4">
        <InkButton size="lg" className="w-full" onClick={onComplete}>
          继续调查
        </InkButton>
      </div>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/views/FeedbackView.tsx
git commit -m "feat: add FeedbackView for investigation results"
```

---

## Task 17: 中央主舞台布局

**Files:**
- Create: `src/components/layout/MainStage.tsx`

### Step 1: 创建中央主舞台

```tsx
// src/components/layout/MainStage.tsx
import { InvestigationView } from '../views/InvestigationView';
import { DialogueView } from '../views/DialogueView';
import { FeedbackView } from '../views/FeedbackView';
import type { GameState, ViewState, NPC, Item } from '../../types/game';

interface MainStageProps {
  gameState: GameState;
  viewState: ViewState;
  activeNPC?: NPC;
  investigatedItem?: Item;
  investigationResult?: {
    description: string;
    cluesFound: any[];
    timeAdvanced: number;
    exposureChange: number;
  };
  onSelectNPC: (npc: NPC) => void;
  onSelectItem: (item: Item) => void;
  onBackToInvestigation: () => void;
  onFeedbackComplete: () => void;
}

export function MainStage({
  gameState,
  viewState,
  activeNPC,
  investigatedItem,
  investigationResult,
  onSelectNPC,
  onSelectItem,
  onBackToInvestigation,
  onFeedbackComplete,
}: MainStageProps) {
  return (
    <main className="h-full bg-[var(--bg-primary)] overflow-hidden">
      {viewState === 'investigation' && (
        <InvestigationView
          gameState={gameState}
          onSelectNPC={onSelectNPC}
          onSelectItem={onSelectItem}
        />
      )}
      
      {viewState === 'dialogue' && activeNPC && (
        <DialogueView
          npc={activeNPC}
          onBack={onBackToInvestigation}
        />
      )}
      
      {viewState === 'feedback' && investigatedItem && investigationResult && (
        <FeedbackView
          item={investigatedItem}
          result={investigationResult}
          onComplete={onFeedbackComplete}
        />
      )}
    </main>
  );
}
```

### Step 2: Commit

```bash
git add src/components/layout/MainStage.tsx
git commit -m "feat: add MainStage layout with view state switching"
```

---

## Task 18: 主布局容器

**Files:**
- Create: `src/components/layout/InvestigationLayout.tsx`

### Step 1: 创建主布局容器

```tsx
// src/components/layout/InvestigationLayout.tsx
import { useState } from 'react';
import { TopBar } from './TopBar';
import { ActionColumn } from './ActionColumn';
import { MainStage } from './MainStage';
import { CaseColumn } from './CaseColumn';
import { IntelBar } from './IntelBar';
import { mockGameState } from '../../data/mock';
import type { ViewState, NPC, Item, Clue } from '../../types/game';

export function InvestigationLayout() {
  const [gameState] = useState(mockGameState);
  const [viewState, setViewState] = useState<ViewState>('investigation');
  const [activeNPC, setActiveNPC] = useState<NPC | undefined>();
  const [investigatedItem, setInvestigatedItem] = useState<Item | undefined>();
  const [newClueIds, setNewClueIds] = useState<string[]>([]);
  
  const [investigationResult, setInvestigationResult] = useState<{
    description: string;
    cluesFound: Clue[];
    timeAdvanced: number;
    exposureChange: number;
  } | undefined>();

  const handleSelectNPC = (npc: NPC) => {
    setActiveNPC(npc);
    setViewState('dialogue');
  };

  const handleSelectItem = (item: Item) => {
    // 模拟调查结果
    setInvestigatedItem(item);
    setInvestigationResult({
      description: `你仔细检查了${item.name}，发现了一些有趣的细节...`,
      cluesFound: gameState.discoveredClues.slice(0, 1),
      timeAdvanced: 10,
      exposureChange: 5,
    });
    setNewClueIds(gameState.discoveredClues.slice(0, 1).map(c => c.id));
    setViewState('feedback');
  };

  const handleBackToInvestigation = () => {
    setViewState('investigation');
    setActiveNPC(undefined);
  };

  const handleFeedbackComplete = () => {
    setViewState('investigation');
    setInvestigatedItem(undefined);
    setInvestigationResult(undefined);
  };

  return (
    <div className="investigation-layout h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* 顶部栏 */}
      <TopBar gameState={gameState} />
      
      {/* 中间三栏 */}
      <div className="main-content flex-1 grid grid-cols-[20%_60%_20%] overflow-hidden">
        {/* 左侧行动列 */}
        <ActionColumn
          gameState={gameState}
          onSelectLocation={() => {}}
          onSelectNPC={handleSelectNPC}
          onSelectItem={handleSelectItem}
          activeNPCId={activeNPC?.id}
        />
        
        {/* 中央主舞台 */}
        <MainStage
          gameState={gameState}
          viewState={viewState}
          activeNPC={activeNPC}
          investigatedItem={investigatedItem}
          investigationResult={investigationResult}
          onSelectNPC={handleSelectNPC}
          onSelectItem={handleSelectItem}
          onBackToInvestigation={handleBackToInvestigation}
          onFeedbackComplete={handleFeedbackComplete}
        />
        
        {/* 右侧案情列 */}
        <CaseColumn
          gameState={gameState}
          onSelectNPC={handleSelectNPC}
          newClueIds={newClueIds}
        />
      </div>
      
      {/* 底部情报带 */}
      <IntelBar 
        unreadClues={newClueIds.length}
        mapPoints={2}
        connectableClues={1}
      />
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/layout/InvestigationLayout.tsx
git commit -m "feat: add InvestigationLayout main container"
```

---

## Task 19: 更新主应用入口

**Files:**
- Modify: `src/App.tsx`

### Step 1: 更新App组件

```tsx
// src/App.tsx
import { InvestigationLayout } from './components/layout/InvestigationLayout';

function App() {
  return <InvestigationLayout />;
}

export default App;
```

### Step 2: 删除旧样式文件引用

```bash
# 检查是否还有引用
# src/App.css 不再被使用，可以删除或保留备用
```

### Step 3: Commit

```bash
git add src/App.tsx
git commit -m "feat: integrate InvestigationLayout into App"
```

---

## Task 20: 最终验证

### Step 1: 运行开发服务器

```bash
pnpm dev
```

预期输出：
```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Step 2: 验证构建

```bash
pnpm build
```

预期输出：
```
vite v8.x.x building for production...
✓ x modules transformed.
dist/                     xxx kb │ gzip: xxx kb
```

### Step 3: 最终提交

```bash
git add .
git commit -m "feat: complete investigation interface implementation

- Add Gothic mystery theme with midnight wine color palette
- Implement 20/60/20 golden ratio grid layout
- Create three core view states: investigation, dialogue, feedback
- Add interactive components: flip cards, risk indicator, ink buttons
- Include mock data for development testing"
```

---

## 自检

**设计文档覆盖检查：**
- [x] 哥特神秘风格配色
- [x] 黄金比例四区布局
- [x] 三种界面状态
- [x] 纸张翻折效果
- [x] 墨水扩散按钮
- [x] 裂纹风险指示器
- [x] 打字机时间显示

**无占位符检查：**
- [x] 无 TBD/TODO
- [x] 无 "implement later"
- [x] 所有代码完整展示

**类型一致性检查：**
- [x] 类型定义与使用一致
- [x] 组件props匹配
