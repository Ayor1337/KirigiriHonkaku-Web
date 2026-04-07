// src/types/api.ts
// 与后端 Pydantic schema 1:1 对应的 TypeScript 接口

// ============================================
// 请求类型
// ============================================

// Step 6: POST /sessions 改为空请求体，不再接收 title 和模板 key
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateSessionRequest {
  // 空请求体
}

export type ActionType = "move" | "talk" | "investigate" | "gather" | "accuse";

export interface ActionRequest {
  session_id: string;
  action_type: ActionType;
  actor_id: string;
  payload: Record<string, unknown>;
  request_id?: string;
}

// ============================================
// 响应类型 — 会话
// ============================================

export interface SessionResponse {
  id: string;
  uuid: string;
  title: string | null;
  status: string;
  start_time_minute: number;
  current_time_minute: number;
  data_directories?: Record<string, string>;
  root_ids?: {
    player_id?: string;
    map_id?: string;
  };
}

export interface SessionBootstrapResponse {
  session_id: string;
  status: string;
  created_counts: Record<string, number>;
  root_ids: {
    player_id: string;
    map_id: string;
  };
}

export type SessionBootstrapStageKey =
  | "session_creating"
  | "session_created"
  | "world_planning"
  | "world_generating"
  | "world_validating"
  | "world_fixing"
  | "world_persisting"
  | "world_ready";

export interface SessionBootstrapStageEvent {
  placeholder: SessionBootstrapStageKey;
  session_id?: string;
  attempt?: number;
  max_attempts?: number;
}

export interface SessionBootstrapErrorEvent {
  code: string;
  message: string;
  session_id?: string;
  failed_placeholder?: SessionBootstrapStageKey;
}

// ============================================
// 响应类型 — 场景快照
// ============================================

export interface SceneLocation {
  key: string;
  name: string;
  description: string | null;
}

export interface ReachableLocation {
  key: string;
  name: string;
}

export interface VisibleNpc {
  key: string;
  display_name: string;
}

export interface InvestigableClue {
  key: string;
  name: string;
  clue_type: string;
}

export interface LatestDialogue {
  dialogue_id: string;
  target_npc_key: string | null;
  location_key: string;
  start_minute: number;
  end_minute: number;
  participant_keys: string[];
}

export interface PublicContext {
  is_public: boolean;
  source: string | null;
  event_key: string | null;
  location_key: string | null;
  participant_keys: string[];
}

export interface RiskInfo {
  countermeasure_triggered: boolean;
  mode: string | null;
  affected_npc_keys: string[];
}

export interface ExposureInfo {
  previous_value: number;
  value: number;
  delta: number;
  previous_level: string;
  level: string;
}

export interface SceneDetails {
  current_location: SceneLocation;
  reachable_locations: ReachableLocation[];
  visible_npcs: VisibleNpc[];
  investigable_clues: InvestigableClue[];
  latest_dialogue: LatestDialogue | null;
  public_context: PublicContext;
  risk: RiskInfo;
  exposure: ExposureInfo;
}

export interface SceneSnapshot {
  session_id: string;
  actor_id: string;
  current_time_minute: number;
  details: SceneDetails;
}

// ============================================
// 响应类型 — 动作结果
// ============================================

export interface InvestigationDelta {
  discovered_clues: string[];
  granted_access_tokens: string[];
}

export interface MovementDelta {
  from_location_key: string;
  to_location_key: string;
}

export interface StateDeltaSummary {
  hard_state_updated: boolean;
  current_time_minute: number;
  accusation_state: string;
  ending_type: string | null;
  module_outputs: Record<string, unknown>;
  movement: MovementDelta | null;
  investigation: InvestigationDelta;
  dialogue: Record<string, unknown> | null;
  exposure: ExposureInfo;
  risk: RiskInfo;
  public_context: PublicContext;
  accusation: Record<string, unknown>;
  ending: Record<string, unknown>;
}

export interface AiTask {
  task_name: string;
  context: Record<string, unknown>;
}

export interface SoftStatePatch {
  allowed: boolean;
  npc_updates: Record<string, Record<string, unknown>>;
  dialogue_updates: Record<string, unknown>;
  rejected_keys: string[];
}

export interface ActionResult {
  status: string;
  action_type: string;
  state_delta_summary: StateDeltaSummary;
  scene_snapshot: SceneSnapshot;
  ai_tasks: AiTask[];
  soft_state_patch: SoftStatePatch;
  narrative_text: string | null;
  storage_refs: Record<string, string>;
  errors: string[];
}

// ============================================
// API 错误
// ============================================

export interface ApiErrorDetail {
  detail: string;
}
