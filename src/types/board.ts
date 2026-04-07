// src/types/board.ts
// 线索板（Mind Place）类型定义

export type BoardElementType = 'clue' | 'npc' | 'location' | 'time' | 'note';

export interface BoardElement {
  id: string;
  type: BoardElementType;
  x: number;
  y: number;
  title: string;
  content: string;
  sourceId?: string; // 关联的原始数据ID（如clue.id）
  createdAt: Date;
  rotation?: number; // 卡片轻微旋转角度，增加物理感
}

export interface BoardConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color: string;
  createdAt: Date;
}

export interface DetectiveBoard {
  elements: BoardElement[];
  connections: BoardConnection[];
  lastModified: Date;
}

// 拖拽状态
export interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

// 连接绘制状态
export interface ConnectingState {
  isConnecting: boolean;
  fromId: string | null;
  currentX: number;
  currentY: number;
}

// 画布视口状态
export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}
