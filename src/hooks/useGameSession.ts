// src/hooks/useGameSession.ts
// 游戏会话状态管理 — 封装 API 调用和场景状态

import { useState, useCallback, useRef } from "react";
import { bootstrapSessionStream, submitAction } from "../api/client";
import type {
  SceneSnapshot,
  StateDeltaSummary,
  ActionType,
  InvestigableClue,
  SessionBootstrapStageEvent,
  SessionBootstrapStageKey,
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
  });

  // actor_id 需要在多次 action 间保持一致
  const playerIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

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
                  clue_type: clueInfo?.clue_type ?? "unknown",
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
            clue_type: info?.clue_type ?? "unknown",
            discovered_at_minute: result.scene_snapshot.current_time_minute,
          };
        }),
        loading: false,
        error: null,
        creationStageKey: null,
        creationStageMeta: null,
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

  /** 用已有 sessionId 恢复（提交一次 investigate 获取当前场景） */
  const resumeGame = useCallback(
    async (sessionId: string, playerId: string) => {
      sessionIdRef.current = sessionId;
      playerIdRef.current = playerId;
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
    (targetNpcKey: string) =>
      doAction("talk", { target_npc_key: targetNpcKey }),
    [doAction],
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
  };
}
