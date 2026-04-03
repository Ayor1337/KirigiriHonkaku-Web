// src/data/mock.ts
// 根据 DATA_STRUCTURE_SPEC.md 和 DATABASE_SCHEMA_SPEC.md 设计的 Mock 数据

import type {
  UUID,
  GameTime,
  Session,
  SessionStatus,
  Character,
  CharacterKind,
  Player,
  PlayerState,
  PlayerInventory,
  PlayerKnowledge,
  KnowledgeTopic,
  KnowledgeEntry,
  DetectiveBoard,
  BoardItem,
  BoardLink,
  BoardNote,
  Npc,
  NpcState,
  NpcSchedule,
  ScheduleEntry,
  GameMap,
  Location,
  Connection,
  Clue,
  ClueType,
  ClueState,
  Event,
  EventType,
  EventState,
  EventParticipant,
  Dialogue,
  DialogueType,
  DialogueParticipant,
  Utterance,
  GameData,
  // 兼容层
  GameState,
  LocationLegacy,
  NPCLegacy,
  ItemLegacy,
  ClueLegacy,
} from '../types/game';

// ============================================
// 工具函数
// ============================================

/** 生成简单 UUID */
function uuid(): UUID {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 游戏时间转换为 Date */
function gameTimeToDate(minutes: GameTime, baseDate: Date = new Date('1924-10-15T00:00:00')): Date {
  const date = new Date(baseDate);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

/** 获取时段描述 */
function getTimePeriod(minutes: GameTime): string {
  const hour = Math.floor(minutes / 60) % 24;
  if (hour >= 5 && hour < 11) return '早晨';
  if (hour >= 11 && hour < 14) return '中午';
  if (hour >= 14 && hour < 18) return '下午';
  if (hour >= 18 && hour < 21) return '傍晚';
  return '夜晚';
}

// ============================================
// Session 根数据
// ============================================

export const mockSession: Session = {
  id: 'sess-001',
  uuid: '550e8400-e29b-41d4-a716-446655440001',
  title: '雾切洋馆事件',
  status: 'active' as SessionStatus,
  start_time_minute: 0,
  current_time_minute: 1140, // 19:00
  incident_time_minute: 1080, // 18:00
  exposure_value: 25,
  exposure_level: 'low',
  case_template_key: 'mansion-murder-01',
  map_template_key: 'mansion-01',
  truth_template_key: 'mansion-truth-01',
  story_file_path: '/cases/mansion/story.md',
  history_file_path: '/cases/mansion/history.md',
  truth_file_path: '/cases/mansion/truth.md',
  created_at: new Date('2024-01-15T10:00:00'),
  updated_at: new Date('2024-01-15T10:00:00'),
};

// ============================================
// 地图体系
// ============================================

export const mockMap: GameMap = {
  id: 'map-001',
  session_id: mockSession.id,
  template_key: 'mansion-01',
  display_name: '雾切洋馆',
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockLocations: Location[] = [
  // 中央大厅区域
  {
    id: 'loc-entrance',
    map_id: mockMap.id,
    name: '正厅入口',
    description: '洋馆的宏伟正门，大理石地板映照着烛火。雨夜中的入口显得格外阴森。',
    location_type: 'indoor',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: 0,
    view_y: 100,
    view_icon: '🏛️',
    view_region: 'main',
    clue_count: 0,
    npc_count: 1,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'loc-hall',
    map_id: mockMap.id,
    name: '中央大厅',
    description: '挑高的大厅，墙上挂着家族肖像。水晶吊灯投下昏黄的光，空气中弥漫着雪茄和威士忌的气息。',
    location_type: 'indoor',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: 0,
    view_y: 0,
    view_icon: '🏺',
    view_region: 'main',
    clue_count: 2,
    npc_count: 0,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'loc-stairs',
    map_id: mockMap.id,
    name: '主楼梯',
    description: '旋转楼梯通向二层，扶手上有精美的雕刻。',
    location_type: 'transition',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: 100,
    view_y: 0,
    view_icon: '🪜',
    view_region: 'main',
    clue_count: 0,
    npc_count: 0,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 东翼 - 主卧区
  {
    id: 'loc-master-bedroom',
    map_id: mockMap.id,
    name: '主卧',
    description: '主人的私人卧室，装饰奢华，床铺整齐，但空气中有一丝不安的气息。',
    location_type: 'indoor',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: 200,
    view_y: -80,
    view_icon: '🛏️',
    view_region: 'east',
    clue_count: 1,
    npc_count: 1,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'loc-study',
    map_id: mockMap.id,
    name: '书房',
    description: '满是古籍的书房，空气中弥漫着墨香。书桌上散落着未完成的信件。',
    location_type: 'indoor',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: 200,
    view_y: 80,
    view_icon: '📚',
    view_region: 'east',
    clue_count: 3,
    npc_count: 0,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 西翼 - 餐厅区
  {
    id: 'loc-dining',
    map_id: mockMap.id,
    name: '餐厅',
    description: '长桌可以容纳二十人用餐，银质餐具整齐摆放，但晚餐被打断。',
    location_type: 'indoor',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: -80,
    view_y: -150,
    view_icon: '🍽️',
    view_region: 'main',
    clue_count: 1,
    npc_count: 0,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'loc-kitchen',
    map_id: mockMap.id,
    name: '厨房',
    description: '繁忙的厨房，飘着烘焙的香气，厨师正在忙碌。',
    location_type: 'indoor',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: -160,
    view_y: -200,
    view_icon: '🍳',
    view_region: 'main',
    clue_count: 0,
    npc_count: 1,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 地下室
  {
    id: 'loc-basement-entrance',
    map_id: mockMap.id,
    name: '地下室入口',
    description: '通往地下的黑暗楼梯，传来阵阵凉意。',
    location_type: 'transition',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: 0,
    view_y: 200,
    view_icon: '🚪',
    view_region: 'basement',
    clue_count: 0,
    npc_count: 0,
    is_locked: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'loc-wine-cellar',
    map_id: mockMap.id,
    name: '酒窖',
    description: '陈年的佳酿收藏于此，酒架上积满灰尘。',
    location_type: 'indoor',
    parent_location_id: 'loc-basement-entrance',
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: -80,
    view_y: 280,
    view_icon: '🍷',
    view_region: 'basement',
    clue_count: 1,
    npc_count: 0,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 秘密房间
  {
    id: 'loc-secret-lab',
    map_id: mockMap.id,
    name: '密室',
    description: '一个隐藏的房间，用途不明，墙上贴满了奇怪的符号和笔记。',
    location_type: 'secret',
    parent_location_id: 'loc-basement-entrance',
    visibility_level: 'hidden',
    is_hidden: true,
    status_flags: {},
    view_x: 0,
    view_y: 380,
    view_icon: '🔮',
    view_region: 'secret',
    clue_count: 3,
    npc_count: 0,
    is_locked: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 花园区域
  {
    id: 'loc-garden-entrance',
    map_id: mockMap.id,
    name: '花园入口',
    description: '通往洋馆后庭的月洞门，雨水顺着石阶流淌。',
    location_type: 'outdoor',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: -250,
    view_y: 50,
    view_icon: '🌿',
    view_region: 'garden',
    clue_count: 0,
    npc_count: 0,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'loc-rose-garden',
    map_id: mockMap.id,
    name: '玫瑰园',
    description: '盛开的红玫瑰围成迷宫，雨中花瓣飘落。',
    location_type: 'outdoor',
    parent_location_id: null,
    visibility_level: 'visible',
    is_hidden: false,
    status_flags: {},
    view_x: -350,
    view_y: -20,
    view_icon: '🌹',
    view_region: 'garden',
    clue_count: 1,
    npc_count: 0,
    is_locked: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockConnections: Connection[] = [
  // 主通道
  {
    id: 'conn-001',
    map_id: mockMap.id,
    from_location_id: 'loc-entrance',
    to_location_id: 'loc-hall',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'conn-002',
    map_id: mockMap.id,
    from_location_id: 'loc-hall',
    to_location_id: 'loc-stairs',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 东翼
  {
    id: 'conn-003',
    map_id: mockMap.id,
    from_location_id: 'loc-stairs',
    to_location_id: 'loc-master-bedroom',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'conn-004',
    map_id: mockMap.id,
    from_location_id: 'loc-stairs',
    to_location_id: 'loc-study',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 西翼
  {
    id: 'conn-005',
    map_id: mockMap.id,
    from_location_id: 'loc-hall',
    to_location_id: 'loc-dining',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'conn-006',
    map_id: mockMap.id,
    from_location_id: 'loc-dining',
    to_location_id: 'loc-kitchen',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 地下室
  {
    id: 'conn-007',
    map_id: mockMap.id,
    from_location_id: 'loc-entrance',
    to_location_id: 'loc-basement-entrance',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'conn-008',
    map_id: mockMap.id,
    from_location_id: 'loc-basement-entrance',
    to_location_id: 'loc-wine-cellar',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 秘密通道
  {
    id: 'conn-009',
    map_id: mockMap.id,
    from_location_id: 'loc-wine-cellar',
    to_location_id: 'loc-secret-lab',
    connection_type: 'secret',
    access_rule: {},
    is_hidden: true,
    is_locked: true,
    is_one_way: false,
    is_dangerous: true,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  // 花园
  {
    id: 'conn-010',
    map_id: mockMap.id,
    from_location_id: 'loc-entrance',
    to_location_id: 'loc-garden-entrance',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'conn-011',
    map_id: mockMap.id,
    from_location_id: 'loc-garden-entrance',
    to_location_id: 'loc-rose-garden',
    connection_type: 'main',
    access_rule: {},
    is_hidden: false,
    is_locked: false,
    is_one_way: false,
    is_dangerous: false,
    time_window_rule: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// ============================================
// 角色体系
// ============================================

export const mockCharacters: Character[] = [
  // 玩家角色
  {
    id: 'char-player',
    session_id: mockSession.id,
    kind: 'player' as CharacterKind,
    display_name: '雾切响子',
    public_identity: '超高校级的侦探',
    current_location_id: 'loc-entrance',
    is_active: true,
    can_participate_dialogue: true,
    can_hold_clue: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // NPC 角色 - 管家
  {
    id: 'char-butler',
    session_id: mockSession.id,
    kind: 'npc' as CharacterKind,
    display_name: '塞巴斯蒂安·莫兰',
    public_identity: '雾切家管家',
    current_location_id: 'loc-entrance',
    is_active: true,
    can_participate_dialogue: true,
    can_hold_clue: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // NPC 角色 - 大小姐
  {
    id: 'char-lady',
    session_id: mockSession.id,
    kind: 'npc' as CharacterKind,
    display_name: '雾切辉夜',
    public_identity: '雾切家大小姐',
    current_location_id: 'loc-master-bedroom',
    is_active: true,
    can_participate_dialogue: true,
    can_hold_clue: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // NPC 角色 - 厨师
  {
    id: 'char-cook',
    session_id: mockSession.id,
    kind: 'npc' as CharacterKind,
    display_name: '皮埃尔·杜邦',
    public_identity: '主厨',
    current_location_id: 'loc-kitchen',
    is_active: true,
    can_participate_dialogue: true,
    can_hold_clue: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // NPC 角色 - 神秘客人
  {
    id: 'char-guest',
    session_id: mockSession.id,
    kind: 'npc' as CharacterKind,
    display_name: '亚瑟·布莱克伍德',
    public_identity: '神秘客人',
    current_location_id: 'loc-study',
    is_active: true,
    can_participate_dialogue: true,
    can_hold_clue: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// ============================================
// 玩家子系统
// ============================================

export const mockPlayer: Player = {
  id: 'player-001',
  session_id: mockSession.id,
  character_id: 'char-player',
  template_key: 'detective-prodigy',
  template_name: '天才侦探',
  trait_text: '拥有超高校级的推理能力，观察力敏锐，擅长从细微处发现真相。',
  background_text: '曾解决过多起悬案，被称为"希望的侦探"。',
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockPlayerState: PlayerState = {
  id: 'player-state-001',
  player_id: mockPlayer.id,
  hp_state: 'healthy',
  injury_state: null,
  poison_state: null,
  exposure_value: 25,
  exposure_level: 'low',
  status_flags: {
    is_investigating: true,
    has_met_butler: true,
    has_seen_body: false,
  },
  temporary_effects: [],
  unlocked_access: ['loc-entrance', 'loc-hall', 'loc-dining', 'loc-garden-entrance'],
  updated_at: new Date(),
};

export const mockPlayerInventory: PlayerInventory = {
  id: 'player-inv-001',
  player_id: mockPlayer.id,
  money_amount: 500,
  resource_flags: {
    has_flashlight: true,
    has_lockpick: false,
  },
  held_item_refs: [],
  equipped_item_refs: [],
  credential_refs: ['cred-detective-badge'],
  weapon_refs: [],
  document_refs: [],
  updated_at: new Date(),
};

export const mockPlayerKnowledge: PlayerKnowledge = {
  id: 'player-know-001',
  player_id: mockPlayer.id,
  summary_text: '雾切洋馆发生了一起神秘事件。死者是雾切家的家主，死亡时间约为18:00。现场发现了一些可疑的线索。',
  last_updated_at: new Date(),
};

export const mockKnowledgeTopics: KnowledgeTopic[] = [
  {
    id: 'topic-001',
    player_knowledge_id: mockPlayerKnowledge.id,
    name: '案件概况',
    description: '关于本次事件的基本信息',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'topic-002',
    player_knowledge_id: mockPlayerKnowledge.id,
    name: '相关人员',
    description: '洋馆内的所有人员信息',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'topic-003',
    player_knowledge_id: mockPlayerKnowledge.id,
    name: '可疑线索',
    description: '发现的各种可疑线索',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockKnowledgeEntries: KnowledgeEntry[] = [
  {
    id: 'entry-001',
    player_knowledge_id: mockPlayerKnowledge.id,
    source_type: 'event',
    source_ref_id: 'evt-murder',
    title: '事件发生',
    content: '雾切家家主被发现死于主卧，死亡时间约为18:00。',
    importance_level: 'critical',
    topic_id: 'topic-001',
    learned_at_minute: 1080,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'entry-002',
    player_knowledge_id: mockPlayerKnowledge.id,
    source_type: 'npc',
    source_ref_id: 'char-butler',
    title: '管家证词',
    content: '管家塞巴斯蒂安声称18:00时听到主卧传来争吵声。',
    importance_level: 'high',
    topic_id: 'topic-002',
    learned_at_minute: 1090,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockDetectiveBoard: DetectiveBoard = {
  id: 'board-001',
  player_id: mockPlayer.id,
  board_layout_version: 1,
  updated_at: new Date(),
};

export const mockBoardItems: BoardItem[] = [
  {
    id: 'board-item-001',
    board_id: mockDetectiveBoard.id,
    target_type: 'npc',
    target_ref_id: 'char-butler',
    position_x: 100,
    position_y: 100,
    group_key: 'suspects',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'board-item-002',
    board_id: mockDetectiveBoard.id,
    target_type: 'clue',
    target_ref_id: 'clue-pocket-watch',
    position_x: 300,
    position_y: 100,
    group_key: 'evidence',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockBoardLinks: BoardLink[] = [
  {
    id: 'board-link-001',
    board_id: mockDetectiveBoard.id,
    from_item_id: 'board-item-001',
    to_item_id: 'board-item-002',
    label: '可能有关',
    style_key: 'dashed',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockBoardNotes: BoardNote[] = [
  {
    id: 'board-note-001',
    board_id: mockDetectiveBoard.id,
    content: '管家的证词与怀表时间有矛盾，需要进一步调查。',
    position_x: 200,
    position_y: 200,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// ============================================
// NPC 子系统
// ============================================

export const mockNpcs: Npc[] = [
  {
    id: 'npc-butler',
    session_id: mockSession.id,
    character_id: 'char-butler',
    profile_file_path: '/npcs/butler/profile.md',
    memory_file_path: '/npcs/butler/memory.md',
    template_key: 'faithful-butler',
    role_type: 'witness',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'npc-lady',
    session_id: mockSession.id,
    character_id: 'char-lady',
    profile_file_path: '/npcs/lady/profile.md',
    memory_file_path: '/npcs/lady/memory.md',
    template_key: 'noble-daughter',
    role_type: 'suspect',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'npc-cook',
    session_id: mockSession.id,
    character_id: 'char-cook',
    profile_file_path: '/npcs/cook/profile.md',
    memory_file_path: '/npcs/cook/memory.md',
    template_key: 'master-chef',
    role_type: 'witness',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'npc-guest',
    session_id: mockSession.id,
    character_id: 'char-guest',
    profile_file_path: '/npcs/guest/profile.md',
    memory_file_path: '/npcs/guest/memory.md',
    template_key: 'mysterious-guest',
    role_type: 'suspect',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockNpcStates: NpcState[] = [
  {
    id: 'npc-state-butler',
    npc_id: 'npc-butler',
    current_location_id: 'loc-entrance',
    attitude_to_player: 'cooperative',
    alertness_level: 'normal',
    emotion_tag: 'anxious',
    is_available: true,
    is_in_event: false,
    is_under_pressure: false,
    state_flags: {
      has_given_testimony: true,
      knows_secret: false,
    },
    updated_at: new Date(),
  },
  {
    id: 'npc-state-lady',
    npc_id: 'npc-lady',
    current_location_id: 'loc-master-bedroom',
    attitude_to_player: 'neutral',
    alertness_level: 'high',
    emotion_tag: 'grief',
    is_available: true,
    is_in_event: false,
    is_under_pressure: true,
    state_flags: {
      is_bereaved: true,
      hiding_something: true,
    },
    updated_at: new Date(),
  },
  {
    id: 'npc-state-cook',
    npc_id: 'npc-cook',
    current_location_id: 'loc-kitchen',
    attitude_to_player: 'friendly',
    alertness_level: 'normal',
    emotion_tag: 'busy',
    is_available: true,
    is_in_event: false,
    is_under_pressure: false,
    state_flags: {},
    updated_at: new Date(),
  },
  {
    id: 'npc-state-guest',
    npc_id: 'npc-guest',
    current_location_id: 'loc-study',
    attitude_to_player: 'hostile',
    alertness_level: 'high',
    emotion_tag: 'suspicious',
    is_available: true,
    is_in_event: false,
    is_under_pressure: true,
    state_flags: {
      has_alibi: false,
    },
    updated_at: new Date(),
  },
];

export const mockNpcSchedules: NpcSchedule[] = [
  {
    id: 'npc-sched-butler',
    npc_id: 'npc-butler',
    schedule_mode: 'event_response',
    updated_at: new Date(),
  },
  {
    id: 'npc-sched-lady',
    npc_id: 'npc-lady',
    schedule_mode: 'grief',
    updated_at: new Date(),
  },
];

export const mockScheduleEntries: ScheduleEntry[] = [
  {
    id: 'sched-entry-001',
    schedule_id: 'npc-sched-butler',
    start_minute: 1080,
    end_minute: 1200,
    behavior_type: 'work',
    behavior_description: '协助调查，回答侦探的问题',
    target_location_id: 'loc-entrance',
    priority: 10,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'sched-entry-002',
    schedule_id: 'npc-sched-lady',
    start_minute: 1080,
    end_minute: 1440,
    behavior_type: 'rest',
    behavior_description: '在主卧休息，偶尔会哭泣',
    target_location_id: 'loc-master-bedroom',
    priority: 5,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// ============================================
// 案件对象
// ============================================

export const mockClues: Clue[] = [
  {
    id: 'clue-pocket-watch',
    session_id: mockSession.id,
    name: '破损的怀表',
    description: '一只停在11点47分的怀表，表盖内侧刻着"献给M"，表面有轻微划痕。',
    clue_type: 'physical' as ClueType,
    initial_location_id: 'loc-hall',
    initial_holder_character_id: null,
    current_location_id: null,
    current_holder_character_id: 'char-player',
    is_key_clue: true,
    is_movable: true,
    is_time_sensitive: true,
    clue_state: 'held' as ClueState,
    document_file_path: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'clue-ledger',
    session_id: mockSession.id,
    name: '奇怪的登记记录',
    description: '登记簿显示昨晚有一位未留下姓名的客人入住302房间，名字栏只画了一个符号——一个倒五角星。',
    clue_type: 'document' as ClueType,
    initial_location_id: 'loc-study',
    initial_holder_character_id: null,
    current_location_id: 'loc-study',
    current_holder_character_id: null,
    is_key_clue: true,
    is_movable: false,
    is_time_sensitive: false,
    clue_state: 'available' as ClueState,
    document_file_path: '/clues/ledger.md',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'clue-broken-vase',
    session_id: mockSession.id,
    name: '破碎的花瓶',
    description: '主卧地上的破碎花瓶，花瓶旁有水渍和泥土痕迹，似乎是刚被打翻不久。',
    clue_type: 'observation' as ClueType,
    initial_location_id: 'loc-master-bedroom',
    initial_holder_character_id: null,
    current_location_id: 'loc-master-bedroom',
    current_holder_character_id: null,
    is_key_clue: false,
    is_movable: false,
    is_time_sensitive: true,
    clue_state: 'available' as ClueType,
    document_file_path: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'clue-wine-stain',
    session_id: mockSession.id,
    name: '红酒渍',
    description: '餐厅地毯上的红酒渍，尚未完全干透。旁边有一张被揉皱的纸条。',
    clue_type: 'observation' as ClueType,
    initial_location_id: 'loc-dining',
    initial_holder_character_id: null,
    current_location_id: null,
    current_holder_character_id: 'char-player',
    is_key_clue: false,
    is_movable: false,
    is_time_sensitive: true,
    clue_state: 'held' as ClueState,
    document_file_path: '/clues/note.md',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'clue-rose-petal',
    session_id: mockSession.id,
    name: '黑色玫瑰花瓣',
    description: '在玫瑰园发现的一片异常黑色的玫瑰花瓣，似乎被某种液体浸泡过。',
    clue_type: 'physical' as ClueType,
    initial_location_id: 'loc-rose-garden',
    initial_holder_character_id: null,
    current_location_id: 'loc-rose-garden',
    current_holder_character_id: null,
    is_key_clue: false,
    is_movable: true,
    is_time_sensitive: false,
    clue_state: 'available' as ClueState,
    document_file_path: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'clue-secret-letter',
    session_id: mockSession.id,
    name: '密信',
    description: '在书房暗格中发现的一封密信，内容涉及家族的秘密交易。',
    clue_type: 'document' as ClueType,
    initial_location_id: 'loc-study',
    initial_holder_character_id: null,
    current_location_id: null,
    current_holder_character_id: 'char-player',
    is_key_clue: true,
    is_movable: true,
    is_time_sensitive: false,
    clue_state: 'held' as ClueState,
    document_file_path: '/clues/secret_letter.md',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockEvents: Event[] = [
  {
    id: 'evt-murder',
    session_id: mockSession.id,
    name: '雾切家主谋杀案',
    event_type: 'incident' as EventType,
    description: '雾切家家主被发现死于主卧，是一起明显的谋杀案。',
    location_id: 'loc-master-bedroom',
    start_minute: 1080,
    end_minute: 1080,
    event_state: 'completed' as EventState,
    is_public_event: true,
    rule_flags: {
      has_body: true,
      is_crime_scene: true,
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'evt-dinner',
    session_id: mockSession.id,
    name: '晚宴',
    event_type: 'routine' as EventType,
    description: '原本计划的家族晚宴，因谋杀案而中断。',
    location_id: 'loc-dining',
    start_minute: 1140,
    end_minute: 1200,
    event_state: 'cancelled' as EventState,
    is_public_event: true,
    rule_flags: {
      was_interrupted: true,
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockEventParticipants: EventParticipant[] = [
  {
    id: 'evt-part-001',
    event_id: 'evt-murder',
    character_id: 'char-lady',
    participant_role: 'observer',
    attendance_state: 'present',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'evt-part-002',
    event_id: 'evt-dinner',
    character_id: 'char-butler',
    participant_role: 'observer',
    attendance_state: 'present',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'evt-part-003',
    event_id: 'evt-dinner',
    character_id: 'char-lady',
    participant_role: 'observer',
    attendance_state: 'absent',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'evt-part-004',
    event_id: 'evt-dinner',
    character_id: 'char-guest',
    participant_role: 'observer',
    attendance_state: 'present',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// ============================================
// 对话体系
// ============================================

export const mockDialogues: Dialogue[] = [
  {
    id: 'dlg-001',
    session_id: mockSession.id,
    dialogue_type: 'interrogation' as DialogueType,
    location_id: 'loc-entrance',
    start_minute: 1090,
    end_minute: 1100,
    summary_file_path: '/dialogues/butler_first_contact_summary.md',
    transcript_file_path: '/dialogues/butler_first_contact.md',
    tag_flags: {
      is_key_dialogue: true,
      revealed_clue: 'clue-pocket-watch',
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'dlg-002',
    session_id: mockSession.id,
    dialogue_type: 'casual' as DialogueType,
    location_id: 'loc-kitchen',
    start_minute: 1110,
    end_minute: 1120,
    summary_file_path: '/dialogues/cook_gossip_summary.md',
    transcript_file_path: '/dialogues/cook_gossip.md',
    tag_flags: {},
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const mockDialogueParticipants: DialogueParticipant[] = [
  {
    id: 'dlg-part-001',
    dialogue_id: 'dlg-001',
    character_id: 'char-player',
    participant_role: 'speaker',
    created_at: new Date(),
  },
  {
    id: 'dlg-part-002',
    dialogue_id: 'dlg-001',
    character_id: 'char-butler',
    participant_role: 'speaker',
    created_at: new Date(),
  },
  {
    id: 'dlg-part-003',
    dialogue_id: 'dlg-002',
    character_id: 'char-player',
    participant_role: 'speaker',
    created_at: new Date(),
  },
  {
    id: 'dlg-part-004',
    dialogue_id: 'dlg-002',
    character_id: 'char-cook',
    participant_role: 'speaker',
    created_at: new Date(),
  },
];

export const mockUtterances: Utterance[] = [
  {
    id: 'utt-001',
    dialogue_id: 'dlg-001',
    sequence_no: 1,
    speaker_character_id: 'char-player',
    content: '管家，能告诉我18:00左右你听到了什么吗？',
    tone_tag: 'questioning',
    utterance_flags: {},
    created_at: new Date(),
  },
  {
    id: 'utt-002',
    dialogue_id: 'dlg-001',
    sequence_no: 2,
    speaker_character_id: 'char-butler',
    content: '是的，侦探小姐。当时我正在楼下整理大厅，突然听到主卧传来争吵声和...一声巨响。',
    tone_tag: 'nervous',
    utterance_flags: {
      reveals_information: true,
    },
    created_at: new Date(),
  },
  {
    id: 'utt-003',
    dialogue_id: 'dlg-001',
    sequence_no: 3,
    speaker_character_id: 'char-player',
    content: '你确定那是18:00吗？',
    tone_tag: 'pressing',
    utterance_flags: {},
    created_at: new Date(),
  },
  {
    id: 'utt-004',
    dialogue_id: 'dlg-001',
    sequence_no: 4,
    speaker_character_id: 'char-butler',
    content: '大厅的座钟刚刚敲过六下，我非常确定。',
    tone_tag: 'defensive',
    utterance_flags: {
      provides_alibi: true,
    },
    created_at: new Date(),
  },
];

// ============================================
// 完整游戏数据容器
// ============================================

export const mockGameData: GameData = {
  session: mockSession,
  characters: mockCharacters,
  player: mockPlayer,
  playerState: mockPlayerState,
  playerInventory: mockPlayerInventory,
  playerKnowledge: mockPlayerKnowledge,
  knowledgeTopics: mockKnowledgeTopics,
  knowledgeEntries: mockKnowledgeEntries,
  detectiveBoard: mockDetectiveBoard,
  boardItems: mockBoardItems,
  boardLinks: mockBoardLinks,
  boardNotes: mockBoardNotes,
  npcs: mockNpcs,
  npcStates: mockNpcStates,
  npcSchedules: mockNpcSchedules,
  scheduleEntries: mockScheduleEntries,
  map: mockMap,
  locations: mockLocations,
  connections: mockConnections,
  clues: mockClues,
  events: mockEvents,
  eventParticipants: mockEventParticipants,
  dialogues: mockDialogues,
  dialogueParticipants: mockDialogueParticipants,
  utterances: mockUtterances,
};

// ============================================
// 兼容层 - 转换为旧版 GameState
// ============================================

/**
 * 将 Location 转换为旧版 LocationLegacy
 */
function toLegacyLocation(location: Location, timeOfDay: string, weather: string): LocationLegacy {
  return {
    id: location.id,
    name: location.name,
    description: location.description || '',
    weather,
    timeOfDay,
  };
}

/**
 * 将 Character + Npc/NpcState 转换为旧版 NPCLegacy
 */
function toLegacyNPC(
  character: Character,
  npc?: Npc,
  npcState?: NpcState,
): NPCLegacy {
  return {
    id: character.id,
    name: character.display_name,
    title: npc?.role_type || character.public_identity || '未知',
    isPresent: npcState?.is_available ?? true,
    dialogueAvailable: character.can_participate_dialogue,
  };
}

/**
 * 将 Clue 转换为旧版 ItemLegacy（作为可调查物品）
 */
function toLegacyItem(clue: Clue, locationId: string): ItemLegacy {
  return {
    id: clue.id,
    name: clue.name,
    description: clue.description || '',
    isInvestigated: clue.clue_state === 'held' || clue.clue_state === 'used',
  };
}

/**
 * 将 Clue 转换为旧版 ClueLegacy
 */
function toLegacyClue(clue: Clue): ClueLegacy {
  return {
    id: clue.id,
    title: clue.name,
    summary: clue.description?.slice(0, 50) + '...' || '暂无描述',
    details: clue.description || '',
    relatedClues: [],
    discoveredAt: clue.created_at,
  };
}

/**
 * 将 GameTime 转换为 Date
 */
function gameTimeToDateLegacy(minutes: GameTime): Date {
  const baseDate = new Date('1924-10-15T00:00:00');
  return new Date(baseDate.getTime() + minutes * 60 * 1000);
}

/**
 * 将新的 GameData 转换为旧版 GameState（兼容层）
 */
export function toLegacyGameState(gameData: GameData): GameState {
  const { session, characters, player, npcs, npcStates, locations, clues, events } = gameData;

  // 获取玩家角色
  const playerCharacter = characters.find(c => c.id === player?.character_id);

  // 当前地点
  const currentLocationId = playerCharacter?.current_location_id || locations[0].id;
  const currentLocation = locations.find(l => l.id === currentLocationId) || locations[0];

  // 天气和时段（从 session 派生或固定值）
  const weather = '雨';
  const timePeriod = getTimePeriod(session.current_time_minute);
  const timeOfDay = timePeriod;

  // 当前地点的 NPC
  const presentNPCs = characters
    .filter(c => c.kind === 'npc' && c.current_location_id === currentLocationId)
    .map(char => {
      const npc = npcs.find(n => n.character_id === char.id);
      const npcState = npcStates.find(ns => ns.npc_id === npc?.id);
      return toLegacyNPC(char, npc, npcState);
    });

  // 所有地点（简化版）
  const availableLocations = locations.map(loc =>
    toLegacyLocation(loc, timeOfDay, weather),
  );

  // 当前地点的物品（线索）
  const availableItems = clues
    .filter(c => c.current_location_id === currentLocationId && c.clue_state === 'available')
    .map(clue => toLegacyItem(clue, currentLocationId));

  // 已发现的线索（被玩家持有的）
  const playerCharacterId = playerCharacter?.id;
  const discoveredClues = clues
    .filter(c => c.current_holder_character_id === playerCharacterId)
    .map(toLegacyClue);

  // 最近事件（从事件生成）
  const recentEvents = events
    .sort((a, b) => b.start_minute - a.start_minute)
    .slice(0, 5)
    .map(e => e.name);

  // 局势描述（动态生成）
  const situation = '雨夜中的洋馆弥漫着不安的气息，家主被害的消息让所有人都绷紧了神经。有人在暗中观察你的行动。';

  return {
    currentLocation: toLegacyLocation(currentLocation, timeOfDay, weather),
    currentTime: gameTimeToDateLegacy(session.current_time_minute),
    timePeriod,
    weather,
    exposureLevel: session.exposure_value,
    availableLocations,
    presentNPCs,
    availableItems,
    discoveredClues,
    recentEvents,
    situation,
  };
}

// ============================================
// 导出旧版兼容的 mockGameState
// ============================================

/** @deprecated 使用 mockGameData，此导出仅供兼容现有组件 */
export const mockGameState: GameState = toLegacyGameState(mockGameData);

// ============================================
// 辅助查询函数
// ============================================

/** 获取指定 ID 的角色 */
export function getCharacterById(gameData: GameData, characterId: UUID): Character | undefined {
  return gameData.characters.find(c => c.id === characterId);
}

/** 获取指定 ID 的地点 */
export function getLocationById(gameData: GameData, locationId: UUID): Location | undefined {
  return gameData.locations.find(l => l.id === locationId);
}

/** 获取指定位置的 NPC */
export function getNPCsAtLocation(gameData: GameData, locationId: UUID): Array<{ character: Character; npc: Npc; state: NpcState }> {
  const characters = gameData.characters.filter(c => c.current_location_id === locationId && c.kind === 'npc');
  return characters.map(char => {
    const npc = gameData.npcs.find(n => n.character_id === char.id)!;
    const state = gameData.npcStates.find(ns => ns.npc_id === npc.id)!;
    return { character: char, npc, state };
  });
}

/** 获取指定位置的线索 */
export function getCluesAtLocation(gameData: GameData, locationId: UUID): Clue[] {
  return gameData.clues.filter(c => c.current_location_id === locationId);
}

/** 获取玩家持有的线索 */
export function getPlayerHeldClues(gameData: GameData): Clue[] {
  const playerCharacter = gameData.characters.find(c => c.id === gameData.player?.character_id);
  if (!playerCharacter) return [];
  return gameData.clues.filter(c => c.current_holder_character_id === playerCharacter.id);
}

/** 获取从某地点可达的连接 */
export function getConnectionsFromLocation(gameData: GameData, locationId: UUID): Connection[] {
  return gameData.connections.filter(
    c => c.from_location_id === locationId && !c.is_locked,
  );
}

/** 获取当前活跃的事件 */
export function getActiveEvents(gameData: GameData): Event[] {
  const currentTime = gameData.session.current_time_minute;
  return gameData.events.filter(
    e => e.start_minute <= currentTime && e.end_minute >= currentTime,
  );
}
