// src/data/mapMock.ts
// 基于新的 Location/Connection 结构的地图数据
// 从 mock.ts 派生，保持视图兼容性

import type { GameMap, MapNode, MapConnection, NodeStatus, ConnectionType } from '../types/map';
import { mockLocations, mockConnections, mockGameData } from './mock';

/**
 * 将 Location 转换为 MapNode（视图层）
 */
function locationToMapNode(location: typeof mockLocations[0]): MapNode {
  // 根据 clue_state 推断状态
  const locationClues = mockGameData.clues.filter(c => c.current_location_id === location.id);
  const hasDiscoveredClue = locationClues.some(c => c.clue_state === 'held');

  let status: NodeStatus = 'unexplored';
  if (location.id === 'loc-entrance') {
    status = 'current';
  } else if (hasDiscoveredClue || !location.is_hidden) {
    status = 'visited';
  }

  return {
    id: location.id,
    x: location.view_x,
    y: location.view_y,
    label: location.name,
    icon: location.view_icon,
    status,
    region: location.view_region || undefined,
    description: location.description || undefined,
    clueCount: location.clue_count,
    npcCount: location.npc_count,
    isLocked: location.is_locked || undefined,
    locationId: location.id,
  };
}

/**
 * 将 Connection 转换为 MapConnection（视图层）
 */
function connectionToMapConnection(connection: typeof mockConnections[0]): MapConnection {
  const typeMap: Record<string, ConnectionType> = {
    'main': 'main',
    'secret': 'secret',
    'locked': 'locked',
    'oneway': 'locked',
  };

  return {
    id: connection.id,
    fromId: connection.from_location_id,
    toId: connection.to_location_id,
    type: typeMap[connection.connection_type || 'main'],
    label: connection.is_hidden ? '秘密通道' : undefined,
  };
}

/** 从新的 Location 数据生成地图节点 */
const mansionNodes: MapNode[] = mockLocations.map(locationToMapNode);

/** 从新的 Connection 数据生成地图连接 */
const mansionConnections: MapConnection[] = mockConnections
  .filter(c => !c.is_hidden) // 隐藏秘密通道，保持神秘感
  .map(connectionToMapConnection);

/** 洋馆网状地图 */
export const mansionMap: GameMap = {
  id: 'mansion-01',
  name: '雾切洋馆',
  description: '一座维多利亚风格的古老洋馆，房间与房间之间通过走廊相连，隐藏着不为人知的秘密通道',
  nodes: mansionNodes,
  connections: mansionConnections,
  centerX: 0,
  centerY: 0,
};

/** 所有可用地图 */
export const availableMaps: GameMap[] = [mansionMap];

/** 根据ID获取地图 */
export function getMapById(id: string): GameMap | undefined {
  return availableMaps.find(m => m.id === id);
}

/** 获取包含秘密通道的完整地图（用于调试或特定剧情） */
export function getFullMapWithSecrets(): GameMap {
  const allConnections = mockConnections.map(connectionToMapConnection);
  return {
    ...mansionMap,
    connections: allConnections,
  };
}

/** 根据当前位置获取可达的节点 */
export function getReachableNodes(currentLocationId: string): MapNode[] {
  const reachableConnectionIds = mockConnections
    .filter(c => c.from_location_id === currentLocationId && !c.is_locked)
    .map(c => c.to_location_id);

  return mansionNodes.filter(node =>
    node.id === currentLocationId || reachableConnectionIds.includes(node.id)
  );
}

/** 检查两个节点之间是否有连接 */
export function hasConnection(fromId: string, toId: string): boolean {
  return mockConnections.some(
    c => c.from_location_id === fromId && c.to_location_id === toId
  );
}

/** 获取节点间的连接详情 */
export function getConnection(fromId: string, toId: string): typeof mockConnections[0] | undefined {
  return mockConnections.find(
    c => c.from_location_id === fromId && c.to_location_id === toId
  );
}
