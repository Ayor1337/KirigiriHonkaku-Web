import { useEffect, useRef, useState } from "react";
import type { SessionResponse } from "../../types/api";
import { SessionCard } from "./SessionCard";
import { getSession } from "../../api/client";

interface SessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionResponse[];
  loading: boolean;
  error: string | null;
  onResume: (sessionId: string, playerId: string) => void;
}

export function SessionDrawer({
  isOpen,
  onClose,
  sessions,
  loading,
  error,
  onResume,
}: SessionDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  // ESC 关闭
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleResume = async (sessionId: string) => {
    if (resumingId) return;
    setResumingId(sessionId);
    setResumeError(null);
    try {
      const detail = await getSession(sessionId);
      const playerId = detail.root_ids?.player_id;
      if (!playerId) {
        setResumeError("该会话尚未初始化，无法继续调查");
        return;
      }
      onResume(sessionId, playerId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "恢复失败，请重试";
      setResumeError(message);
    } finally {
      setResumingId((prev) => (prev === sessionId ? null : prev));
    }
  };

  return (
    <div
      className={`
        fixed inset-0 z-50
        transition-opacity duration-300
        ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
      aria-hidden={!isOpen}
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* 抽屉 */}
      <div
        ref={panelRef}
        className={`
          absolute bottom-0 left-1/2 -translate-x-1/2
          w-[60%] h-7/8
          transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "translate-y-0" : "translate-y-full"}
          flex flex-col
        `}
      >
        {/* 头部 */}
        <div className="relative flex items-center justify-center py-5">
          <h2 className="font-serif text-xl tracking-wide text-(--text-primary)">
            历史调查
          </h2>
          <button
            onClick={onClose}
            className="
              absolute right-0 top-1/2 -translate-y-1/2
              w-9 h-9 flex items-center justify-center
              rounded-lg border border-(--border-color)
              text-(--text-secondary)
              transition-colors duration-200
              hover:border-(--accent-primary) hover:text-(--text-primary)
            "
            aria-label="关闭"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto py-6">
          {resumeError && (
            <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-200 flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="flex-1">{resumeError}</span>
              <button
                onClick={() => setResumeError(null)}
                className="shrink-0 text-red-300 hover:text-red-100"
                aria-label="清除错误"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="
                    h-24 rounded-lg border border-(--border-color)
                    bg-(--bg-secondary) animate-pulse
                  "
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-3xl mb-3">⚠️</div>
              <p className="text-(--text-primary) font-serif mb-2">加载失败</p>
              <p className="text-sm text-(--text-secondary) max-w-xs">
                {error}
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 mb-6 rounded-full border border-(--border-color) flex items-center justify-center text-(--text-muted)">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-serif text-(--text-primary) mb-1">
                尚无尘封的案卷
              </p>
              <p className="text-sm text-(--text-muted)">
                开始一次新的调查，写下第一页记录。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isResuming={resumingId === session.id}
                  onResume={() => handleResume(session.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
