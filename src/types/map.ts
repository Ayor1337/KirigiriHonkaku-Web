// src/types/map.ts

/** 节点探索状态 */
export type NodeStatus =
  | 'unexplored'  // 未探索（迷雾）
  | 'visited'     // 已访问
  | 'current';    // 当前位置

/** 连接类型 */
export type ConnectionType = 'main' | 'secret' | 'locked';

/** 地图节点 */
export interface MapNode {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: string;
  status: NodeStatus;
  region?: string;     // 区域分组
  description?: string;
  clueCount: number;
  npcCount: number;
  isLocked?: boolean;
  locationId?: string; // 关联的地点ID
}

/** 节点连接 */
export interface MapConnection {
  id: string;
  fromId: string;
  toId: string;
  type: ConnectionType;
  label?: string;
}

/** 完整地图数据 */
export interface GameMap {
  id: string;
  name: string;
  description: string;
  nodes: MapNode[];
  connections: MapConnection[];
  centerX: number;     // 视觉中心点
  centerY: number;
}

/** 地图视图状态 */
export interface MapViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  selectedNodeId?: string;
  hoveredNodeId?: string;
}
