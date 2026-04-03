// src/types/game.ts
// 根据 DATA_STRUCTURE_SPEC.md 和 DATABASE_SCHEMA_SPEC.md 定义的游戏数据类型

// ============================================
// 基础类型
// ============================================

/** UUID 类型别名 */
export type UUID = string;

/** 游戏时间（从游戏开始起的分钟数） */
export type GameTime = number;

/** 角色类型 */
export type CharacterKind = 'player' | 'npc';

/** 暴露等级 */
export type ExposureLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

/** 会话状态 */
export type SessionStatus = 'active' | 'paused' | 'ended' | 'archived';

/** 地点类型 */
export type LocationType = 'indoor' | 'outdoor' | 'transition' | 'secret';

/** 连接类型 */
export type ConnectionType = 'main' | 'secret' | 'locked' | 'oneway';

/** 线索类型 */
export type ClueType = 'physical' | 'testimony' | 'document' | 'observation';

/** 线索状态 */
export type ClueState = 'hidden' | 'available' | 'held' | 'used' | 'consumed';

/** 事件类型 */
export type EventType = 'incident' | 'routine' | 'special' | 'emergency';

/** 事件状态 */
export type EventState = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

/** 对话类型 */
export type DialogueType = 'casual' | 'interrogation' | 'confrontation' | 'revelation';

/** 参与者角色 */
export type ParticipantRole = 'speaker' | 'listener' | 'observer' | 'target';

/** 出席状态 */
export type AttendanceState = 'present' | 'absent' | 'late' | 'left';

/** 日程行为类型 */
export type BehaviorType = 'idle' | 'work' | 'travel' | 'rest' | 'event' | 'hidden';

// ============================================
// 视图状态（保持与现有组件兼容）
// ============================================

export type ViewState = 'investigation' | 'dialogue' | 'feedback' | 'board' | 'map';

// ============================================
// 会话根表
// ============================================

/**
 * Session - 一局游戏的根实体
 * 表示一局完整游戏，是一切数据的根归属
 */
export interface Session {
  // 标识信息
  id: UUID;
  uuid: string;
  title: string;

  // 时间信息（游戏内时间，以分钟为单位）
  start_time_minute: GameTime;
  current_time_minute: GameTime;
  incident_time_minute: GameTime | null;

  // 游戏状态
  status: SessionStatus;
  ending_type: string | null;
  accusation_state: string | null;
  exposure_value: number;
  exposure_level: ExposureLevel;

  // 模板来源
  case_template_key: string | null;
  map_template_key: string | null;
  truth_template_key: string | null;

  // 文本附件引用（文件路径）
  story_file_path: string | null;
  history_file_path: string | null;
  truth_file_path: string | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

// ============================================
// 角色体系 - Character（公共壳）
// ============================================

/**
 * Character - 玩家和 NPC 的公共壳
 * 统一所有"谁在说话、谁在场、谁持有某物"的关系
 */
export interface Character {
  // 标识信息
  id: UUID;
  session_id: UUID;
  kind: CharacterKind;

  // 基础信息
  display_name: string;
  public_identity: string | null;

  // 空间信息
  current_location_id: UUID | null;

  // 互动能力
  is_active: boolean;
  can_participate_dialogue: boolean;
  can_hold_clue: boolean;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

// ============================================
// 玩家子系统
// ============================================

/**
 * Player - 玩家角色主实体
 * 用于连接玩家专属子系统
 */
export interface Player {
  // 标识信息
  id: UUID;
  session_id: UUID;
  character_id: UUID;

  // 模板信息
  template_key: string | null;
  template_name: string | null;

  // 角色构筑
  trait_text: string | null;
  background_text: string | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * PlayerState - 玩家当前动态状态
 */
export interface PlayerState {
  // 标识信息
  id: UUID;
  player_id: UUID;

  // 生命与风险
  hp_state: string | null;
  injury_state: string | null;
  poison_state: string | null;

  // 暴露与局势
  exposure_value: number;
  exposure_level: ExposureLevel;

  // 临时状态（JSONB）
  status_flags: Record<string, unknown>;
  temporary_effects: Record<string, unknown>;

  // 可达权限
  unlocked_access: unknown[];

  // 审计信息
  updated_at: Date;
}

/**
 * PlayerInventory - 玩家持有资源与物品状态
 * 第一阶段保持轻量，使用引用而非完整 Item 实体
 */
export interface PlayerInventory {
  // 标识信息
  id: UUID;
  player_id: UUID;

  // 资源概览
  money_amount: number;
  resource_flags: Record<string, unknown>;

  // 物品容器（引用数组）
  held_item_refs: unknown[];
  equipped_item_refs: unknown[];

  // 特殊持有（引用数组）
  credential_refs: unknown[];
  weapon_refs: unknown[];
  document_refs: unknown[];

  // 审计信息
  updated_at: Date;
}

/**
 * PlayerKnowledge - 玩家统一知识池容器
 */
export interface PlayerKnowledge {
  // 标识信息
  id: UUID;
  player_id: UUID;

  // 汇总状态
  summary_text: string | null;
  last_updated_at: Date | null;
}

/**
 * KnowledgeTopic - 知识主题归类
 */
export interface KnowledgeTopic {
  // 标识信息
  id: UUID;
  player_knowledge_id: UUID;

  // 分类信息
  name: string;
  description: string | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * KnowledgeEntry - 一条玩家已纳入知识池的信息
 */
export interface KnowledgeEntry {
  // 标识信息
  id: UUID;
  player_knowledge_id: UUID;

  // 来源信息
  source_type: string;
  source_ref_id: UUID | null;

  // 内容信息
  title: string | null;
  content: string;
  importance_level: string | null;

  // 归类信息
  topic_id: UUID | null;

  // 时间信息
  learned_at_minute: GameTime | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * DetectiveBoard - 玩家唯一的侦探板实体
 */
export interface DetectiveBoard {
  // 标识信息
  id: UUID;
  player_id: UUID;

  // 视图状态
  board_layout_version: number;

  // 审计信息
  updated_at: Date;
}

/**
 * BoardItemTargetType - 侦探板卡片允许引用的目标类型
 */
export type BoardItemTargetType = 'npc' | 'location' | 'clue' | 'event';

/**
 * BoardItem - 侦探板上的卡片
 */
export interface BoardItem {
  // 标识信息
  id: UUID;
  board_id: UUID;

  // 引用信息
  target_type: BoardItemTargetType;
  target_ref_id: UUID;

  // 展示信息
  position_x: number;
  position_y: number;
  group_key: string | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * BoardLink - 两张卡片之间的连接
 */
export interface BoardLink {
  // 标识信息
  id: UUID;
  board_id: UUID;

  // 连接信息
  from_item_id: UUID;
  to_item_id: UUID;

  // 展示信息
  label: string | null;
  style_key: string | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * BoardNote - 侦探板上的自由备注
 */
export interface BoardNote {
  // 标识信息
  id: UUID;
  board_id: UUID;

  // 内容信息
  content: string;

  // 展示信息
  position_x: number;
  position_y: number;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

// ============================================
// NPC 子系统
// ============================================

/**
 * Npc - NPC 主实体
 */
export interface Npc {
  // 标识信息
  id: UUID;
  session_id: UUID;
  character_id: UUID;

  // 基础设定引用
  profile_file_path: string | null;
  memory_file_path: string | null;

  // 模板信息
  template_key: string | null;
  role_type: string | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * NpcState - NPC 当前状态
 */
export interface NpcState {
  // 标识信息
  id: UUID;
  npc_id: UUID;

  // 空间状态
  current_location_id: UUID | null;

  // 互动状态
  attitude_to_player: string | null;
  alertness_level: string | null;
  emotion_tag: string | null;

  // 规则状态
  is_available: boolean;
  is_in_event: boolean;
  is_under_pressure: boolean;
  state_flags: Record<string, unknown>;

  // 审计信息
  updated_at: Date;
}

/**
 * NpcSchedule - NPC 的日程容器
 */
export interface NpcSchedule {
  // 标识信息
  id: UUID;
  npc_id: UUID;

  // 汇总状态
  schedule_mode: string | null;

  // 审计信息
  updated_at: Date;
}

/**
 * ScheduleEntry - 一条日程安排
 */
export interface ScheduleEntry {
  // 标识信息
  id: UUID;
  schedule_id: UUID;

  // 时间范围
  start_minute: GameTime;
  end_minute: GameTime;

  // 行为信息
  behavior_type: BehaviorType;
  behavior_description: string | null;

  // 位置目标
  target_location_id: UUID | null;

  // 优先级
  priority: number;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

// ============================================
// 地图体系
// ============================================

/**
 * GameMap - 会话中的空间骨架
 */
export interface GameMap {
  // 标识信息
  id: UUID;
  session_id: UUID;

  // 模板信息
  template_key: string | null;
  display_name: string | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * Location - 地图中的统一空间点
 * 支持父级层次，但不强制所有地图严格三层
 */
export interface Location {
  // 标识信息
  id: UUID;
  map_id: UUID;

  // 基础信息
  name: string;
  description: string | null;
  location_type: LocationType;

  // 层级信息
  parent_location_id: UUID | null;

  // 展示与状态
  visibility_level: string | null;
  is_hidden: boolean;
  status_flags: Record<string, unknown>;

  // 视图字段（用于地图可视化）
  view_x: number;
  view_y: number;
  view_icon: string;
  view_region: string | null;
  clue_count: number;
  npc_count: number;
  is_locked: boolean;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * Connection - 两个 Location 之间的连接关系
 */
export interface Connection {
  // 标识信息
  id: UUID;
  map_id: UUID;

  // 连接信息
  from_location_id: UUID;
  to_location_id: UUID;

  // 类型信息
  connection_type: ConnectionType | null;

  // 条件信息
  access_rule: Record<string, unknown>;
  is_hidden: boolean;
  is_locked: boolean;
  is_one_way: boolean;
  is_dangerous: boolean;

  // 时间信息
  time_window_rule: Record<string, unknown>;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

// ============================================
// 案件对象
// ============================================

/**
 * Clue - 统一线索实体
 * 区分初始归属和当前归属，当前归属只能是 Location 或 Character（Player/NPC）
 */
export interface Clue {
  // 标识信息
  id: UUID;
  session_id: UUID;

  // 基础信息
  name: string;
  description: string | null;
  clue_type: ClueType;

  // 初始归属（二选一）
  initial_location_id: UUID | null;
  initial_holder_character_id: UUID | null;

  // 当前归属（二选一）
  current_location_id: UUID | null;
  current_holder_character_id: UUID | null;

  // 状态信息
  is_key_clue: boolean;
  is_movable: boolean;
  is_time_sensitive: boolean;
  clue_state: ClueState | null;

  // 文本附件
  document_file_path: string | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * Event - 地点在某段时间里的特殊规则状态
 */
export interface Event {
  // 标识信息
  id: UUID;
  session_id: UUID;

  // 基础信息
  name: string;
  event_type: EventType;
  description: string | null;

  // 位置与时间
  location_id: UUID;
  start_minute: GameTime;
  end_minute: GameTime;

  // 规则状态
  event_state: EventState | null;
  is_public_event: boolean;
  rule_flags: Record<string, unknown>;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * EventParticipant - 参与某个事件的角色
 */
export interface EventParticipant {
  // 标识信息
  id: UUID;
  event_id: UUID;

  // 角色信息
  character_id: UUID;

  // 参与状态
  participant_role: ParticipantRole | null;
  attendance_state: AttendanceState | null;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

// ============================================
// 对话体系
// ============================================

/**
 * Dialogue - 一次完整会话
 * 不是单条发言，而是完整对话
 */
export interface Dialogue {
  // 标识信息
  id: UUID;
  session_id: UUID;

  // 基础信息
  dialogue_type: DialogueType | null;
  location_id: UUID;

  // 时间信息
  start_minute: GameTime;
  end_minute: GameTime | null;

  // 结果信息（文本附件路径）
  summary_file_path: string | null;
  transcript_file_path: string | null;
  tag_flags: Record<string, unknown>;

  // 审计信息
  created_at: Date;
  updated_at: Date;
}

/**
 * DialogueParticipant - 会话中的参与方
 */
export interface DialogueParticipant {
  // 标识信息
  id: UUID;
  dialogue_id: UUID;

  // 角色信息
  character_id: UUID;

  // 参与状态
  participant_role: ParticipantRole | null;

  // 审计信息
  created_at: Date;
}

/**
 * Utterance - 会话中的单条发言
 * 每条只对应一个说话方，统一指向 Character
 */
export interface Utterance {
  // 标识信息
  id: UUID;
  dialogue_id: UUID;

  // 顺序信息
  sequence_no: number;

  // 说话方
  speaker_character_id: UUID;

  // 内容信息
  content: string;

  // 标签信息
  tone_tag: string | null;
  utterance_flags: Record<string, unknown>;

  // 审计信息
  created_at: Date;
}

// ============================================
// 完整游戏状态容器（用于传递）
// ============================================

/**
 * GameData - 一局游戏的完整数据
 * 包含所有实体，用于在组件间传递完整状态
 */
export interface GameData {
  session: Session;
  characters: Character[];
  player: Player | null;
  playerState: PlayerState | null;
  playerInventory: PlayerInventory | null;
  playerKnowledge: PlayerKnowledge | null;
  knowledgeTopics: KnowledgeTopic[];
  knowledgeEntries: KnowledgeEntry[];
  detectiveBoard: DetectiveBoard | null;
  boardItems: BoardItem[];
  boardLinks: BoardLink[];
  boardNotes: BoardNote[];
  npcs: Npc[];
  npcStates: NpcState[];
  npcSchedules: NpcSchedule[];
  scheduleEntries: ScheduleEntry[];
  map: GameMap | null;
  locations: Location[];
  connections: Connection[];
  clues: Clue[];
  events: Event[];
  eventParticipants: EventParticipant[];
  dialogues: Dialogue[];
  dialogueParticipants: DialogueParticipant[];
  utterances: Utterance[];
}

// ============================================
// 旧版类型（兼容层 - 供组件继续使用）
// ============================================

/**
 * @deprecated 使用新的 GameData 结构，此类型仅供兼容
 */
export interface LocationLegacy {
  id: string;
  name: string;
  description: string;
  weather: string;
  timeOfDay: string;
}

/**
 * @deprecated 使用新的 GameData 结构，此类型仅供兼容
 */
export interface NPCLegacy {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  isPresent: boolean;
  dialogueAvailable: boolean;
}

/**
 * @deprecated 使用新的 GameData 结构，此类型仅供兼容
 */
export interface ItemLegacy {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isInvestigated: boolean;
}

/**
 * @deprecated 使用新的 GameData 结构，此类型仅供兼容
 */
export interface ClueLegacy {
  id: string;
  title: string;
  summary: string;
  details: string;
  relatedClues: string[];
  discoveredAt: Date;
}

/**
 * @deprecated 使用新的 GameData 结构，此类型仅供兼容
 */
export interface GameState {
  currentLocation: LocationLegacy;
  currentTime: Date;
  timePeriod: string;
  weather: string;
  exposureLevel: number; // 0-100
  availableLocations: LocationLegacy[];
  presentNPCs: NPCLegacy[];
  availableItems: ItemLegacy[];
  discoveredClues: ClueLegacy[];
  recentEvents: string[];
  situation: string;
}

/**
 * @deprecated 使用新的 GameData 结构
 */
export interface DialogueOption {
  id: string;
  text: string;
  npcId: string;
  timeCost: number;
}

/**
 * @deprecated 使用新的 GameData 结构
 */
export interface InvestigationResult {
  itemId: string;
  description: string;
  cluesFound: ClueLegacy[];
  timeAdvanced: number;
  newLocations?: LocationLegacy[];
  newNPCs?: NPCLegacy[];
  exposureChange: number;
}
