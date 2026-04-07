import type { SessionResponse } from "../../types/api";

interface SessionCardProps {
  session: SessionResponse;
  onResume: () => void;
  isResuming?: boolean;
}

function formatGameTime(minute: number): string {
  const day = Math.floor(minute / 1440) + 1;
  const hh = String(Math.floor((minute % 1440) / 60)).padStart(2, "0");
  const mm = String(minute % 60).padStart(2, "0");
  return `Day ${day} · ${hh}:${mm}`;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "ready":
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    case "ended":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    case "generating":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "draft":
    default:
      return "bg-(--bg-tertiary) text-(--text-muted) border-(--border-color)";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "ready":
      return "就绪";
    case "ended":
      return "已结束";
    case "generating":
      return "生成中";
    case "draft":
      return "草稿";
    default:
      return status;
  }
}

export function SessionCard({ session, onResume, isResuming }: SessionCardProps) {
  const isReady = session.status === "ready";

  return (
    <div
      onClick={isResuming || !isReady ? undefined : onResume}
      className={`
        group relative flex flex-col gap-3
        p-4 rounded-lg border
        bg-(--bg-secondary) border-(--border-color)
        transition-all duration-300
        ${isReady ? "hover:border-(--accent-primary) hover:bg-(--bg-tertiary) cursor-pointer" : "opacity-80 cursor-default"}
        ${isResuming ? "opacity-70 cursor-not-allowed" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-(--text-primary) truncate">
            {session.title ?? "未命名调查"}
          </h3>
          <p className="mt-1 font-mono text-xs text-(--text-muted)">
            {formatGameTime(session.current_time_minute)}
          </p>
        </div>
        <span
          className={`
            shrink-0 text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider
            ${statusBadgeClass(session.status)}
          `}
        >
          {statusLabel(session.status)}
        </span>
      </div>

      <div className="flex items-center justify-end gap-3 pt-1">
        {isResuming ? (
          <span className="flex items-center gap-1 text-xs text-(--text-secondary)">
            <span>恢复中...</span>
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        ) : !isReady ? (
          <span className="text-xs text-(--text-muted)">
            {session.status === "ended"
              ? "已结案"
              : session.status === "generating"
                ? "生成中"
                : "草稿"}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-(--text-secondary) group-hover:text-(--text-primary) transition-colors duration-300">
            <span>继续调查</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
