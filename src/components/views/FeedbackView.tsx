// src/components/views/FeedbackView.tsx
import { useEffect, useState } from "react";
import { InkButton } from "../ui/InkButton";
import type { StateDeltaSummary } from "../../types/api";

interface FeedbackViewProps {
  narrativeText?: string | null;
  lastDelta?: StateDeltaSummary | null;
  onComplete: () => void;
}

export function FeedbackView({
  narrativeText,
  lastDelta,
  onComplete,
}: FeedbackViewProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const investigation = lastDelta?.investigation;
  const movement = lastDelta?.movement;
  const discoveredClues = investigation?.discovered_clues ?? [];
  const grantedTokens = investigation?.granted_access_tokens ?? [];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* 标题 */}
      <header>
        <h2 className="text-sm text-(--text-muted) uppercase tracking-wider mb-2">
          行动结果
        </h2>
        <h1 className="font-heading text-2xl text-(--text-primary)">
          行动反馈
        </h1>
      </header>

      {/* 叙事描述 */}
      {narrativeText && (
        <section className="p-6 bg-(--bg-secondary) border border-(--border-color) rounded-lg">
          <p className="text-lg text-(--text-primary) leading-relaxed">
            {narrativeText}
          </p>
        </section>
      )}

      {/* 发现的线索 */}
      {discoveredClues.length > 0 && (
        <section>
          <h3 className="font-heading text-xl text-(--accent-primary) mb-4 flex items-center gap-2">
            <span>发现的线索</span>
            <span className="text-sm px-2 py-0.5 bg-(--accent-primary) text-white rounded">
              {discoveredClues.length}
            </span>
          </h3>
          <div className="space-y-3">
            {discoveredClues.map((clueKey, index) => (
              <div
                key={clueKey}
                style={{
                  opacity: showDetails ? 1 : 0,
                  transform: showDetails ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.5s ease ${index * 0.2}s`,
                }}
                className="p-4 bg-(--bg-secondary) border border-(--accent-primary) rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-(--accent-primary)"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  <span className="font-medium text-(--text-primary)">
                    {clueKey}
                  </span>
                  <span className="px-2 py-0.5 text-xs bg-(--accent-primary) text-white rounded">
                    新
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 状态变化 */}
      <section className="space-y-3">
        <h3 className="font-heading text-lg text-(--text-primary)">状态变化</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 暴露度变化 */}
          {lastDelta?.exposure?.delta != null &&
            lastDelta.exposure.delta !== 0 && (
              <div className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg">
                <div className="text-sm text-(--text-muted) mb-1">
                  暴露度变化
                </div>
                <div
                  className={`font-mono text-lg ${
                    lastDelta.exposure.delta > 0
                      ? "text-(--danger)"
                      : "text-(--success)"
                  }`}
                >
                  {lastDelta.exposure.delta > 0 ? "+" : ""}
                  {lastDelta.exposure.delta}%
                </div>
                <div className="text-xs text-(--text-muted) mt-1">
                  {lastDelta.exposure.previous_level} →{" "}
                  {lastDelta.exposure.level}
                </div>
              </div>
            )}

          {/* 当前时间 */}
          {lastDelta?.current_time_minute != null && (
            <div className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg">
              <div className="text-sm text-(--text-muted) mb-1">
                当前游戏时间
              </div>
              <div className="font-mono text-lg text-(--text-primary)">
                {String(
                  Math.floor(lastDelta.current_time_minute / 60) % 24,
                ).padStart(2, "0")}
                :{String(lastDelta.current_time_minute % 60).padStart(2, "0")}
              </div>
            </div>
          )}
        </div>

        {/* 解锁通行证 */}
        {grantedTokens.length > 0 && (
          <div className="p-4 bg-(--bg-tertiary) border border-(--accent-primary) rounded-lg">
            <div className="text-sm text-(--accent-primary) mb-2">
              解锁通行证
            </div>
            <div className="flex flex-wrap gap-2">
              {grantedTokens.map((token) => (
                <span
                  key={token}
                  className="text-(--text-primary) px-2 py-1 bg-(--bg-secondary) rounded text-sm"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 新到达地点 */}
        {movement?.to_location_key && (
          <div className="p-4 bg-(--bg-tertiary) border border-(--accent-primary) rounded-lg">
            <div className="text-sm text-(--accent-primary) mb-2">已抵达</div>
            <span className="text-(--text-primary)">
              {movement.to_location_key}
            </span>
          </div>
        )}
      </section>

      {/* 完成按钮 */}
      <div className="pt-4">
        <InkButton size="lg" className="w-full" onClick={onComplete}>
          继续调查
        </InkButton>
      </div>
    </div>
  );
}
