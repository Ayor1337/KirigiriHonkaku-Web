// src/components/layout/CaseColumn.tsx
import type { VisibleNpc } from "../../types/api";
import type { DiscoveredClue } from "../../hooks/useGameSession";

interface CaseColumnProps {
  visibleNpcs: VisibleNpc[];
  discoveredClues: DiscoveredClue[];
  newClueKeys?: string[];
  onTalkNpc: (npcKey: string) => void;
  narrativeText?: string | null;
  loading?: boolean;
}

export function CaseColumn({
  visibleNpcs,
  discoveredClues,
  newClueKeys = [],
  onTalkNpc,
  narrativeText,
  loading,
}: CaseColumnProps) {
  return (
    <aside className="h-full bg-(--bg-primary) border-l border-(--border-color) overflow-y-auto p-4 space-y-6">
      {/* 在场NPC */}
      <section>
        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
          在场人物
        </h3>
        <div className="flex flex-wrap gap-2">
          {visibleNpcs.map((npc) => (
            <button
              key={npc.key}
              disabled={loading}
              onClick={() => onTalkNpc(npc.key)}
              className={`flex items-center gap-2 px-3 py-2 bg-(--bg-secondary) border rounded-lg transition-colors ${
                loading ? "border-(--border-color) opacity-50 cursor-not-allowed" : "border-(--border-color) hover:border-(--accent-primary)"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-(--text-muted)"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="text-sm text-(--text-primary)">
                {npc.display_name}
              </span>
            </button>
          ))}
          {visibleNpcs.length === 0 && (
            <p className="text-sm text-(--text-muted) italic">此处无人...</p>
          )}
        </div>
      </section>

      {/* 最新线索 */}
      <section>
        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
          已发现线索
        </h3>
        <div className="space-y-3">
          {discoveredClues
            .slice(-5)
            .reverse()
            .map((clue) => (
              <div
                key={clue.key}
                className={`p-3 bg-(--bg-secondary) border rounded-lg ${
                  newClueKeys.includes(clue.key)
                    ? "border-(--accent-primary) animate-[pulse-glow_0.6s_ease-in-out_2]"
                    : "border-(--border-color)"
                }`}
              >
                <h4 className="font-heading text-sm text-(--accent-primary) mb-1">
                  {clue.name}
                </h4>
                <div className="text-xs text-(--text-muted)">
                  {clue.clue_type}
                </div>
                {newClueKeys.includes(clue.key) && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-(--accent-primary) text-white rounded">
                    新
                  </span>
                )}
              </div>
            ))}
          {discoveredClues.length === 0 && (
            <p className="text-sm text-(--text-muted) italic">
              尚未发现任何线索...
            </p>
          )}
        </div>
      </section>

      {/* 最近叙事 */}
      {narrativeText && (
        <section>
          <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
            最近动态
          </h3>
          <div className="text-sm text-(--text-secondary) pl-3 border-l-2 border-(--border-color) leading-relaxed">
            {narrativeText}
          </div>
        </section>
      )}
    </aside>
  );
}
