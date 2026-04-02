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
