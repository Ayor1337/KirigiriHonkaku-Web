import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useGameSession } from "../../hooks/useGameSession";
import { getSessions } from "../../api/client";
import type {
  SessionBootstrapStageEvent,
  SessionBootstrapStageKey,
  SessionResponse,
} from "../../types/api";
import { SessionDrawer } from "../ui/SessionDrawer";

const STAGE_LABELS: Record<SessionBootstrapStageKey, string> = {
  session_creating: "正在建立调查卷宗...",
  session_created: "卷宗已建立，准备生成案件...",
  world_planning: "正在规划案件结构...",
  world_generating: "正在生成世界内容...",
  world_validating: "正在校验案件结构...",
  world_fixing: "正在修正生成结果...",
  world_persisting: "正在写入调查现场...",
  world_ready: "案件已就绪，正在进入现场...",
};

function getStageLabel(
  stageKey: SessionBootstrapStageKey | null,
  stageMeta: SessionBootstrapStageEvent | null,
): string {
  if (!stageKey) {
    return "正在准备调查...";
  }

  if (
    stageKey === "world_validating" &&
    stageMeta?.attempt != null &&
    stageMeta?.max_attempts != null
  ) {
    return `正在校验案件结构（${stageMeta.attempt}/${stageMeta.max_attempts}）...`;
  }

  if (stageKey === "world_fixing" && stageMeta?.attempt) {
    return `正在修正生成结果（第 ${stageMeta.attempt} 次）...`;
  }

  return STAGE_LABELS[stageKey];
}

export function HomeView() {
  const navigate = useNavigate();
  const game = useGameSession();
  const [mounted] = useState(true);
  const [titleRevealed, setTitleRevealed] = useState(0);
  const [subtitleRevealed, setSubtitleRevealed] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const title = "霧切本格";
  const subtitle = "KIRIGIRI HONKAKU";

  useEffect(() => {
    // 逐字显现标题
    const titleInterval = setInterval(() => {
      setTitleRevealed((prev) => {
        if (prev >= title.length) {
          clearInterval(titleInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 180);

    // 副标题延迟显现
    const subtitleTimer = setTimeout(
      () => {
        setSubtitleRevealed(true);
      },
      title.length * 180 + 400,
    );

    // 按钮延迟显现
    const buttonTimer = setTimeout(
      () => {
        setButtonVisible(true);
      },
      title.length * 180 + 800,
    );

    return () => {
      clearInterval(titleInterval);
      clearTimeout(subtitleTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleStartGame = async () => {
    try {
      const { sessionId, playerId } = await game.startGame();
      navigate(`/game?sessionId=${sessionId}&playerId=${playerId}`);
    } catch {
      // error is already stored in game.error
    }
  };

  const handleOpenHistory = async () => {
    setDrawerOpen(true);
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const list = await getSessions();
      // 优先展示有较新游戏时间的会话
      const sorted = [...list].sort(
        (a, b) => b.current_time_minute - a.current_time_minute,
      );
      setSessions(sorted);
    } catch (err) {
      const message = err instanceof Error ? err.message : "请求失败";
      setSessionsError(message);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleResumeSession = (sessionId: string, playerId: string) => {
    navigate(`/game?sessionId=${sessionId}&playerId=${playerId}`);
  };

  return (
    <div
      className={`
        relative w-full h-screen overflow-hidden
        bg-(--bg-primary)
        flex flex-col items-center justify-center
        transition-opacity duration-1000
        ${mounted ? "opacity-100" : "opacity-0"}
      `}
    >
      {/* 噪点纹理背景 */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 中央光晕 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(190, 75, 219, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* 顶部装饰线 */}
      <div
        className={`
          absolute top-[15%] left-1/2 -translate-x-1/2
          h-px bg-linear-to-r from-transparent via-(--border-color) to-transparent
          transition-all duration-1000 delay-500
          ${mounted ? "w-32 opacity-100" : "w-0 opacity-0"}
        `}
      />

      {/* 主标题区域 */}
      <div className="relative z-10 text-center px-8">
        {/* 日文标题 - 逐字显现 */}
        <h1 className="font-serif text-[clamp(3rem,12vw,8rem)] tracking-[0.3em] mb-6">
          {title.split("").map((char, index) => (
            <span
              key={index}
              className={`
                inline-block transition-all duration-500
                ${
                  index < titleRevealed
                    ? "opacity-100 translate-y-0 blur-0"
                    : "opacity-0 translate-y-4 blur-sm"
                }
              `}
              style={{
                color:
                  index < titleRevealed ? "var(--text-primary)" : "transparent",
                textShadow:
                  index < titleRevealed
                    ? "0 0 40px rgba(190, 75, 219, 0.3)"
                    : "none",
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* 英文副标题 */}
        <p
          className={`
            font-serif text-[clamp(0.75rem,2vw,1rem)] tracking-[0.6em]
            text-(--text-muted) transition-all duration-700
            ${subtitleRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          {subtitle}
        </p>
      </div>

      {/* 底部装饰线 */}
      <div
        className={`
          absolute bottom-[15%] left-1/2 -translate-x-1/2
          h-px bg-linear-to-r from-transparent via-(--border-color) to-transparent
          transition-all duration-1000 delay-700
          ${mounted ? "w-32 opacity-100" : "w-0 opacity-0"}
        `}
      />

      {/* 按钮组 */}
      <div
        className={`
          absolute bottom-[20%] left-1/2 -translate-x-1/2
          flex flex-col sm:flex-row items-center gap-4
          transition-all duration-500
          ${buttonVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}
        `}
      >
        {/* 历史调查 */}
        <button
          onClick={handleOpenHistory}
          disabled={game.loading}
          className="
            group flex items-center gap-3
            px-8 py-4
            font-serif text-sm tracking-[0.3em] uppercase
            text-(--text-secondary)
            border border-(--border-color)
            bg-transparent
            transition-all duration-500
            hover:border-(--accent-primary) hover:text-(--text-primary)
            hover:shadow-[0_0_30px_rgba(190,75,219,0.2)]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span>历史调查</span>
        </button>

        {/* 进入调查 */}
        <button
          onClick={handleStartGame}
          disabled={game.loading}
          className="
            group flex items-center gap-3
            px-8 py-4
            font-serif text-sm tracking-[0.3em] uppercase
            text-(--text-secondary)
            border border-(--border-color)
            bg-transparent
            transition-all duration-500
            hover:border-(--accent-primary) hover:text-(--text-primary)
            hover:shadow-[0_0_30px_rgba(190,75,219,0.2)]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <span>进入调查</span>
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {game.error && (
        <p className="absolute bottom-[12%] left-1/2 -translate-x-1/2 text-sm text-red-400">
          {game.error}
        </p>
      )}

      {game.loading && (
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex items-center gap-2 text-(--text-muted) text-sm">
          <div className="w-4 h-4 border-2 border-(--accent-primary) border-t-transparent rounded-full animate-spin" />
          <span>
            {getStageLabel(game.creationStageKey, game.creationStageMeta)}
          </span>
        </div>
      )}

      {/* 角落装饰 */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l border-t border-(--border-color) opacity-50" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r border-t border-(--border-color) opacity-50" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l border-b border-(--border-color) opacity-50" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-(--border-color) opacity-50" />

      {/* 历史调查抽屉 */}
      <SessionDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sessions={sessions}
        loading={sessionsLoading}
        error={sessionsError}
        onResume={handleResumeSession}
      />
    </div>
  );
}
