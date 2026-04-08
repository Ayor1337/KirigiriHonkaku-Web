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

export interface SessionPlayer {
  id: string;
  character_id: string;
  display_name: string;
  public_identity: string | null;
  template_key: string | null;
  template_name: string | null;
  trait_text: string | null;
  background_text: string | null;
  current_location_id: string | null;
  current_location_name: string | null;
  exposure_value: number;
  exposure_level: string;
}

export interface SessionMapLocation {
  id: string;
  key: string;
  parent_location_id: string | null;
  name: string;
  description: string | null;
  location_type: string | null;
  visibility_level: string | null;
  is_hidden: boolean;
  status_flags: Record<string, unknown>;
}

export interface SessionMapConnection {
  id: string;
  from_location_id: string;
  to_location_id: string;
  connection_type: string | null;
  access_rule: Record<string, unknown>;
  is_hidden: boolean;
  is_locked: boolean;
  is_one_way: boolean;
  is_dangerous: boolean;
  time_window_rule: Record<string, unknown>;
}

export interface SessionMap {
  id: string;
  template_key: string | null;
  display_name: string | null;
  locations: SessionMapLocation[];
  connections: SessionMapConnection[];
}

export interface SessionNpc {
  id: string;
  character_id: string;
  template_key: string | null;
  display_name: string;
  public_identity: string | null;
  current_location_id: string | null;
  current_location_name: string | null;
  has_met_player: boolean;
}

export interface SessionStateResponse {
  exposure_value: number;
  exposure_level: string;
}

export interface SessionResponse {
  id: string;
  uuid: string;
  title: string | null;
  status: string;
  start_time_minute: number;
  current_time_minute: number;
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

export interface SceneMapLocation {
  key: string;
  name: string;
  view_x: number;
  view_y: number;
  view_icon: string;
  is_locked: boolean;
}

export interface SceneMapConnection {
  from_key: string;
  to_key: string;
  connection_type: string | null;
  is_locked: boolean;
}

export interface SceneMapSnapshot {
  map_name: string;
  locations: SceneMapLocation[];
  connections: SceneMapConnection[];
}

export interface VisibleNpc {
  key: string;
  display_name: string;
}

export interface InvestigableClue {
  key: string;
  name: string;
  clue_type: string | { key?: string; name?: string; clue_type?: unknown };
}

export function getClueTypeLabel(clueType: unknown): string {
  if (typeof clueType === "string") return clueType;
  if (clueType && typeof clueType === "object") {
    const obj = clueType as { name?: string; key?: string };
    if (typeof obj.name === "string") return obj.name;
    if (typeof obj.key === "string") return obj.key;
  }
  return "unknown";
}

export interface LatestDialogue {
  dialogue_id: string;
  target_npc_key: string | null;
  target_npc_name: string | null;
  location_id: string;
  location_key: string;
  location_name: string;
  start_minute: number;
  end_minute: number;
  utterance_count: number;
  last_utterance_preview: string | null;
}

export interface Utterance {
  sequence_no: number;
  speaker_role: "player" | "npc" | "narrator" | "system";
  speaker_name: string;
  content: string;
  tone_tag?: string | null;
  utterance_flags?: Record<string, unknown>;
}

export interface DialogueDetail {
  dialogue_id: string;
  target_npc_key: string;
  target_npc_name: string;
  location_id: string;
  location_key: string;
  location_name: string;
  start_minute: number;
  end_minute: number;
  utterance_count: number;
  last_utterance_preview: string;
  tag_flags: Record<string, string>;
  utterances: Utterance[];
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
  map_snapshot: SceneMapSnapshot | null;
  weather: string | null;
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

export interface DialogueDelta {
  dialogue_id: string | null;
}

export interface StateDeltaSummary {
  hard_state_updated: boolean;
  current_time_minute: number;
  accusation_state: string;
  ending_type: string | null;
  module_outputs: Record<string, unknown>;
  movement: MovementDelta | null;
  investigation: InvestigationDelta;
  dialogue: DialogueDelta | null;
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
  errors: string[];
}

// ============================================
// API 错误
// ============================================

export interface ApiErrorDetail {
  detail: string;
}
