// src/data/mapMock.ts
import type { GameMap, MapNode, MapConnection } from '../types/map';

/** 洋馆主馆节点 */
const mansionNodes: MapNode[] = [
  // 中央大厅区域
  {
    id: 'entrance',
    x: 0,
    y: 100,
    label: '正厅入口',
    icon: '🏛️',
    status: 'current',
    region: 'main',
    description: '洋馆的宏伟正门，大理石地板映照着烛火',
    clueCount: 0,
    npcCount: 1,
  },
  {
    id: 'hall',
    x: 0,
    y: 0,
    label: '中央大厅',
    icon: '🏺',
    status: 'visited',
    region: 'main',
    description: '挑高的大厅，墙上挂着家族肖像',
    clueCount: 2,
    npcCount: 0,
  },
  {
    id: 'stairs',
    x: 100,
    y: 0,
    label: '主楼梯',
    icon: '🪜',
    status: 'visited',
    region: 'main',
    description: '旋转楼梯通向二层',
    clueCount: 0,
    npcCount: 0,
  },

  // 东翼 - 主卧区
  {
    id: 'master-bedroom',
    x: 200,
    y: -80,
    label: '主卧',
    icon: '🛏️',
    status: 'visited',
    region: 'east',
    description: '主人的私人卧室，装饰奢华',
    clueCount: 1,
    npcCount: 1,
  },
  {
    id: 'dressing-room',
    x: 280,
    y: -120,
    label: '更衣室',
    icon: '👗',
    status: 'unexplored',
    region: 'east',
    description: '存放着主人的华服',
    clueCount: 0,
    npcCount: 0,
    isLocked: true,
  },
  {
    id: 'study',
    x: 200,
    y: 80,
    label: '书房',
    icon: '📚',
    status: 'visited',
    region: 'east',
    description: '满是古籍的书房，空气中弥漫着墨香',
    clueCount: 3,
    npcCount: 0,
  },
  {
    id: 'library',
    x: 280,
    y: 120,
    label: '藏书室',
    icon: '📖',
    status: 'unexplored',
    region: 'east',
    description: '珍贵的藏书收藏室',
    clueCount: 2,
    npcCount: 0,
  },

  // 西翼 - 客房区
  {
    id: 'guest-room-a',
    x: -150,
    y: -60,
    label: '客房A',
    icon: '🛏️',
    status: 'unexplored',
    region: 'west',
    description: '为访客准备的卧室',
    clueCount: 1,
    npcCount: 0,
  },
  {
    id: 'guest-room-b',
    x: -220,
    y: -100,
    label: '客房B',
    icon: '🛏️',
    status: 'unexplored',
    region: 'west',
    description: '另一间客房',
    clueCount: 0,
    npcCount: 0,
  },

  // 北侧 - 功能区
  {
    id: 'dining',
    x: -80,
    y: -150,
    label: '餐厅',
    icon: '🍽️',
    status: 'visited',
    region: 'main',
    description: '长桌可以容纳二十人用餐',
    clueCount: 1,
    npcCount: 0,
  },
  {
    id: 'kitchen',
    x: -160,
    y: -200,
    label: '厨房',
    icon: '🍳',
    status: 'visited',
    region: 'main',
    description: '繁忙的厨房，飘着烘焙的香气',
    clueCount: 0,
    npcCount: 1,
  },

  // 地下室入口
  {
    id: 'basement-entrance',
    x: 0,
    y: 200,
    label: '地下室入口',
    icon: '🚪',
    status: 'visited',
    region: 'basement',
    description: '通往地下的黑暗楼梯',
    clueCount: 0,
    npcCount: 0,
    isLocked: true,
  },
  {
    id: 'wine-cellar',
    x: -80,
    y: 280,
    label: '酒窖',
    icon: '🍷',
    status: 'unexplored',
    region: 'basement',
    description: '陈年的佳酿收藏于此',
    clueCount: 1,
    npcCount: 0,
  },
  {
    id: 'storage',
    x: 80,
    y: 280,
    label: '储藏室',
    icon: '📦',
    status: 'unexplored',
    region: 'basement',
    description: '堆放杂物的储藏空间',
    clueCount: 2,
    npcCount: 0,
  },
  {
    id: 'secret-lab',
    x: 0,
    y: 380,
    label: '密室',
    icon: '🔮',
    status: 'unexplored',
    region: 'secret',
    description: '一个隐藏的房间，用途不明',
    clueCount: 3,
    npcCount: 0,
    isLocked: true,
  },

  // 花园区域
  {
    id: 'garden-entrance',
    x: -250,
    y: 50,
    label: '花园入口',
    icon: '🌿',
    status: 'visited',
    region: 'garden',
    description: '通往洋馆后庭的月洞门',
    clueCount: 0,
    npcCount: 0,
  },
  {
    id: 'rose-garden',
    x: -350,
    y: -20,
    label: '玫瑰园',
    icon: '🌹',
    status: 'visited',
    region: 'garden',
    description: '盛开的红玫瑰围成迷宫',
    clueCount: 1,
    npcCount: 0,
  },
  {
    id: 'fountain',
    x: -400,
    y: 80,
    label: '中央喷泉',
    icon: '⛲',
    status: 'unexplored',
    region: 'garden',
    description: '精美的巴洛克式喷泉',
    clueCount: 1,
    npcCount: 0,
  },
  {
    id: 'greenhouse',
    x: -450,
    y: -50,
    label: '温室',
    icon: '🪴',
    status: 'unexplored',
    region: 'garden',
    description: '种植着珍稀植物的玻璃温室',
    clueCount: 2,
    npcCount: 1,
  },
  {
    id: 'maze',
    x: -500,
    y: 50,
    label: '树篱迷宫',
    icon: '🌳',
    status: 'unexplored',
    region: 'garden',
    description: '复杂的树篱迷宫，容易迷失方向',
    clueCount: 0,
    npcCount: 0,
  },
];

/** 洋馆连接关系 */
const mansionConnections: MapConnection[] = [
  // 主通道
  { id: 'c1', fromId: 'entrance', toId: 'hall', type: 'main' },
  { id: 'c2', fromId: 'hall', toId: 'stairs', type: 'main' },

  // 东翼
  { id: 'c3', fromId: 'stairs', toId: 'master-bedroom', type: 'main' },
  { id: 'c4', fromId: 'master-bedroom', toId: 'dressing-room', type: 'main' },
  { id: 'c5', fromId: 'stairs', toId: 'study', type: 'main' },
  { id: 'c6', fromId: 'study', toId: 'library', type: 'main' },

  // 西翼
  { id: 'c7', fromId: 'hall', toId: 'guest-room-a', type: 'main' },
  { id: 'c8', fromId: 'guest-room-a', toId: 'guest-room-b', type: 'main' },

  // 北侧
  { id: 'c9', fromId: 'hall', toId: 'dining', type: 'main' },
  { id: 'c10', fromId: 'dining', toId: 'kitchen', type: 'main' },

  // 地下室
  { id: 'c11', fromId: 'entrance', toId: 'basement-entrance', type: 'main' },
  { id: 'c12', fromId: 'basement-entrance', toId: 'wine-cellar', type: 'main' },
  { id: 'c13', fromId: 'basement-entrance', toId: 'storage', type: 'main' },

  // 秘密通道
  { id: 'c14', fromId: 'library', toId: 'secret-lab', type: 'secret' },
  { id: 'c15', fromId: 'storage', toId: 'secret-lab', type: 'secret' },
  { id: 'c16', fromId: 'wine-cellar', toId: 'secret-lab', type: 'secret' },

  // 花园
  { id: 'c17', fromId: 'entrance', toId: 'garden-entrance', type: 'main' },
  { id: 'c18', fromId: 'garden-entrance', toId: 'rose-garden', type: 'main' },
  { id: 'c19', fromId: 'garden-entrance', toId: 'fountain', type: 'main' },
  { id: 'c20', fromId: 'rose-garden', toId: 'greenhouse', type: 'main' },
  { id: 'c21', fromId: 'fountain', toId: 'maze', type: 'main' },
  { id: 'c22', fromId: 'greenhouse', toId: 'maze', type: 'secret' },
];

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
