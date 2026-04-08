// src/hooks/useGameSession.ts
// 游戏会话状态管理 — 封装 API 调用和场景状态

import { useState, useCallback, useRef, useEffect } from "react";
import {
  bootstrapSessionStream,
  submitAction,
  getSessionPlayer,
  getSessionMap,
  getSessionNPCs,
  getDialogue,
  getSessionDialogues,
} from "../api/client";
import {
  getClueTypeLabel,
} from "../types/api";
import type {
  SceneSnapshot,
  StateDeltaSummary,
  ActionType,
  InvestigableClue,
  SessionBootstrapStageEvent,
  SessionBootstrapStageKey,
  SessionPlayer,
  SessionMap,
  SessionNpc,
  DialogueDetail,
  LatestDialogue,
} from "../types/api";

/** 已发现线索记录（前端累积追踪） */
export interface DiscoveredClue {
  key: string;
  name: string;
  clue_type: string;
  discovered_at_minute: number;
}

/** 已访问地点记录（用于地图战争迷雾展开） */
export interface VisitedLocation {
  key: string;
  name: string;
}

interface GameSessionState {
  sessionId: string | null;
  playerId: string | null;
  scene: SceneSnapshot | null;
  lastDelta: StateDeltaSummary | null;
  narrativeText: string | null;
  discoveredClues: DiscoveredClue[];
  visitedLocations: VisitedLocation[];
  loading: boolean;
  error: string | null;
  creationStageKey: SessionBootstrapStageKey | null;
  creationStageMeta: SessionBootstrapStageEvent | null;
  playerProfile: SessionPlayer | null;
  mapData: SessionMap | null;
  npcs: SessionNpc[];
  dialogues: LatestDialogue[];
  currentDialogue: DialogueDetail | null;
  dialogueLoading: boolean;
}

const CACHE_PREFIX = "kirigiri:session:";
const CACHE_MAX_COUNT = 3;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface SessionCache {
  scene: SceneSnapshot;
  lastDelta: StateDeltaSummary | null;
  narrativeText: string | null;
  discoveredClues: DiscoveredClue[];
  visitedLocations: VisitedLocation[];
  playerProfile: SessionPlayer | null;
  mapData: SessionMap | null;
  npcs: SessionNpc[];
  dialogues: LatestDialogue[];
  currentDialogue: DialogueDetail | null;
  cachedAt: number;
}

function getCacheKey(sessionId: string) {
  return `${CACHE_PREFIX}${sessionId}`;
}

function saveSessionCache(sessionId: string, data: Omit<SessionCache, "cachedAt">) {
  try {
    const cache: SessionCache = { ...data, cachedAt: Date.now() };
    localStorage.setItem(getCacheKey(sessionId), JSON.stringify(cache));

    const keys: { key: string; cachedAt: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) {
        try {
          const v = JSON.parse(localStorage.getItem(k) || "{}") as SessionCache;
          keys.push({ key: k, cachedAt: v.cachedAt || 0 });
        } catch {
          // ignore
        }
      }
    }
    keys.sort((a, b) => b.cachedAt - a.cachedAt);
    for (let i = CACHE_MAX_COUNT; i < keys.length; i++) {
      localStorage.removeItem(keys[i].key);
    }
  } catch {
    // 存储失败静默处理
  }
}

function loadSessionCache(sessionId: string): SessionCache | null {
  try {
    const raw = localStorage.getItem(getCacheKey(sessionId));
    if (!raw) return null;
    const cache = JSON.parse(raw) as SessionCache;
    if (!cache.cachedAt || Date.now() - cache.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(getCacheKey(sessionId));
      return null;
    }
    return cache;
  } catch {
    return null;
  }
}

// Step 6: 模板选择已移除，会话创建改为空请求体，世界由 AGENT 生成

export function useGameSession() {
  const [state, setState] = useState<GameSessionState>({
    sessionId: null,
    playerId: null,
    scene: null,
    lastDelta: null,
    narrativeText: null,
    discoveredClues: [],
    visitedLocations: [],
    loading: false,
    error: null,
    creationStageKey: null,
    creationStageMeta: null,
    playerProfile: null,
    mapData: null,
    npcs: [],
    dialogues: [],
    currentDialogue: null,
    dialogueLoading: false,
  });

  // actor_id 需要在多次 action 间保持一致
  const playerIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // 当核心场景数据变化时自动写入本地缓存
  useEffect(() => {
    if (state.sessionId && state.scene) {
      saveSessionCache(state.sessionId, {
        scene: state.scene,
        lastDelta: state.lastDelta,
        narrativeText: state.narrativeText,
        discoveredClues: state.discoveredClues,
        visitedLocations: state.visitedLocations,
        playerProfile: state.playerProfile,
        mapData: state.mapData,
        npcs: state.npcs,
        dialogues: state.dialogues,
        currentDialogue: state.currentDialogue,
      });
    }
  }, [
    state.sessionId,
    state.scene,
    state.lastDelta,
    state.narrativeText,
    state.discoveredClues,
    state.visitedLocations,
    state.playerProfile,
    state.mapData,
    state.npcs,
    state.dialogues,
    state.currentDialogue,
  ]);

  /** 提交动作的内部方法 */
  const doAction = useCallback(
    async (actionType: ActionType, payload: Record<string, unknown> = {}) => {
      if (!sessionIdRef.current || !playerIdRef.current) {
        throw new Error("Session not initialized");
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await submitAction({
          session_id: sessionIdRef.current,
          action_type: actionType,
          actor_id: playerIdRef.current,
          payload,
        });

        setState((prev) => {
          // 累积已发现线索
          const newClues: DiscoveredClue[] = [];
          if (result.state_delta_summary.investigation?.discovered_clues) {
            for (const clueKey of result.state_delta_summary.investigation
              .discovered_clues) {
              if (!prev.discoveredClues.some((c) => c.key === clueKey)) {
                // 从 investigable_clues 中查找名称（如果还在列表中）
                const clueInfo =
                  result.scene_snapshot.details.investigable_clues.find(
                    (c: InvestigableClue) => c.key === clueKey,
                  );
                newClues.push({
                  key: clueKey,
                  name: clueInfo?.name ?? clueKey,
                  clue_type: getClueTypeLabel(clueInfo?.clue_type),
                  discovered_at_minute:
                    result.scene_snapshot.current_time_minute,
                });
              }
            }
          }

          // 累积已访问地点
          const currentLoc = result.scene_snapshot.details.current_location;
          const visitedLocations = prev.visitedLocations.some(
            (v) => v.key === currentLoc.key,
          )
            ? prev.visitedLocations
            : [
                ...prev.visitedLocations,
                { key: currentLoc.key, name: currentLoc.name },
              ];

          return {
            ...prev,
            scene: result.scene_snapshot,
            lastDelta: result.state_delta_summary,
            narrativeText: result.narrative_text,
            discoveredClues: [...prev.discoveredClues, ...newClues],
            visitedLocations,
            loading: false,
            error:
              result.status === "rejected"
                ? (result.narrative_text ?? "动作被拒绝")
                : null,
          };
        });

        // 异步刷新已遇见 NPC 列表（talk/investigate 等动作可能改变 has_met_player）
        if (sessionIdRef.current) {
          getSessionNPCs(sessionIdRef.current)
            .then((npcs) => {
              setState((prev) => ({ ...prev, npcs }));
            })
            .catch(() => {
              // 忽略刷新失败
            });
        }

        // 异步拉取对话详情与会话对话列表
        const dialogueId = result.state_delta_summary.dialogue?.dialogue_id;
        if (dialogueId && sessionIdRef.current) {
          setState((prev) => ({ ...prev, dialogueLoading: true }));
          getDialogue(sessionIdRef.current, dialogueId)
            .then((detail) => {
              setState((prev) => ({ ...prev, currentDialogue: detail }));
            })
            .catch(() => {
              // 忽略刷新失败
            })
            .finally(() => {
              setState((prev) => ({ ...prev, dialogueLoading: false }));
            });
          getSessionDialogues(sessionIdRef.current)
            .then((dialogues) => {
              setState((prev) => ({ ...prev, dialogues }));
            })
            .catch(() => {
              // 忽略刷新失败
            });
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "请求失败";
        setState((prev) => ({ ...prev, loading: false, error: message }));
        throw err;
      }
    },
    [],
  );

  /** 创建并初始化游戏（Step 6: 空请求体，AGENT 生成世界） */
  const startGame = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      creationStageKey: null,
      creationStageMeta: null,
    }));

    try {
      const bootstrap = await bootstrapSessionStream({
        onStage: (event) => {
          if (event.session_id) {
            sessionIdRef.current = event.session_id;
          }
          setState((prev) => ({
            ...prev,
            sessionId: event.session_id ?? prev.sessionId,
            creationStageKey: event.placeholder,
            creationStageMeta: event,
          }));
        },
      });

      const sessionId = bootstrap.session_id;
      const playerId = bootstrap.root_ids.player_id;
      sessionIdRef.current = sessionId;
      playerIdRef.current = playerId;

      setState((prev) => ({
        ...prev,
        sessionId,
        playerId,
      }));

      // 首次 investigate 获取初始 scene_snapshot
      const result = await submitAction({
        session_id: sessionId,
        action_type: "investigate",
        actor_id: playerId,
        payload: {},
      });

      const currentLoc = result.scene_snapshot.details.current_location;

      // 同时拉取玩家资料、完整地图与已遇见 NPC 列表
      let playerProfile: SessionPlayer | null = null;
      let mapData: SessionMap | null = null;
      let npcs: SessionNpc[] = [];
      try {
        [playerProfile, mapData, npcs] = await Promise.all([
          getSessionPlayer(sessionId),
          getSessionMap(sessionId),
          getSessionNPCs(sessionId),
        ]);
      } catch {
        // 获取元数据失败不影响主流程
      }

      setState((prev) => ({
        ...prev,
        scene: result.scene_snapshot,
        lastDelta: result.state_delta_summary,
        narrativeText: result.narrative_text,
        visitedLocations: [{ key: currentLoc.key, name: currentLoc.name }],
        discoveredClues: (
          result.state_delta_summary.investigation?.discovered_clues ?? []
        ).map((clueKey: string) => {
          const info = result.scene_snapshot.details.investigable_clues.find(
            (c: InvestigableClue) => c.key === clueKey,
          );
          return {
            key: clueKey,
            name: info?.name ?? clueKey,
            clue_type: getClueTypeLabel(info?.clue_type),
            discovered_at_minute: result.scene_snapshot.current_time_minute,
          };
        }),
        loading: false,
        error: null,
        creationStageKey: null,
        creationStageMeta: null,
        playerProfile: playerProfile ?? null,
        mapData: mapData ?? null,
        npcs: npcs ?? [],
      }));

      return { sessionId, playerId };
    } catch (err) {
      const message = err instanceof Error ? err.message : "游戏创建失败";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
        creationStageKey: null,
        creationStageMeta: null,
      }));
      throw err;
    }
  }, []);

  /** 用已有 sessionId 恢复（优先读取本地缓存，命中则跳过 investigate） */
  const resumeGame = useCallback(
    async (sessionId: string, playerId: string) => {
      sessionIdRef.current = sessionId;
      playerIdRef.current = playerId;

      const cached = loadSessionCache(sessionId);
      if (cached) {
        setState((prev) => ({
          ...prev,
          sessionId,
          playerId,
          scene: cached.scene,
          lastDelta: cached.lastDelta,
          narrativeText: cached.narrativeText,
          discoveredClues: cached.discoveredClues,
          visitedLocations: cached.visitedLocations,
          playerProfile: cached.playerProfile,
          mapData: cached.mapData,
          npcs: cached.npcs,
          dialogues: cached.dialogues ?? [],
          currentDialogue: cached.currentDialogue ?? null,
          loading: false,
          error: null,
        }));

        // 异步刷新辅助元数据（不修改游戏状态）
        Promise.all([
          getSessionPlayer(sessionId),
          getSessionMap(sessionId),
          getSessionNPCs(sessionId),
        ])
          .then(([playerProfile, mapData, npcs]) => {
            setState((prev) => ({
              ...prev,
              playerProfile: playerProfile ?? null,
              mapData: mapData ?? null,
              npcs: npcs ?? [],
            }));
          })
          .catch(() => {
            // 忽略刷新失败
          });
        return;
      }

      setState((prev) => ({
        ...prev,
        sessionId,
        playerId,
        discoveredClues: [],
        visitedLocations: [],
        loading: true,
        error: null,
      }));

      try {
        await doAction("investigate", {});
        const [playerProfile, mapData, npcs] = await Promise.all([
          getSessionPlayer(sessionId),
          getSessionMap(sessionId),
          getSessionNPCs(sessionId),
        ]);
        setState((prev) => ({
          ...prev,
          playerProfile: playerProfile ?? null,
          mapData: mapData ?? null,
          npcs: npcs ?? [],
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "恢复游戏失败";
        setState((prev) => ({ ...prev, loading: false, error: message }));
      }
    },
    [doAction],
  );

  // 暴露的 action 方法
  const move = useCallback(
    (targetLocationKey: string) =>
      doAction("move", { target_location_key: targetLocationKey }),
    [doAction],
  );

  const talk = useCallback(
    (targetNpcKey: string, text: string = "") =>
      doAction("talk", { target_npc_key: targetNpcKey, text }),
    [doAction],
  );

  const fetchDialogue = useCallback(
    async (dialogueId: string) => {
      if (!sessionIdRef.current) return;
      setState((prev) => ({ ...prev, dialogueLoading: true }));
      try {
        const detail = await getDialogue(sessionIdRef.current, dialogueId);
        setState((prev) => ({ ...prev, currentDialogue: detail }));
      } catch {
        // 忽略刷新失败
      } finally {
        setState((prev) => ({ ...prev, dialogueLoading: false }));
      }
    },
    [],
  );

  const investigate = useCallback(
    () => doAction("investigate", {}),
    [doAction],
  );

  const gather = useCallback(() => doAction("gather", {}), [doAction]);

  const accuse = useCallback(
    (targetNpcKey: string) =>
      doAction("accuse", { target_npc_key: targetNpcKey }),
    [doAction],
  );

  return {
    ...state,
    startGame,
    resumeGame,
    move,
    talk,
    investigate,
    gather,
    accuse,
    fetchDialogue,
  };
}
