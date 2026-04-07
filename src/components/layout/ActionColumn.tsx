// src/components/layout/ActionColumn.tsx
import { InkButton } from "../ui/InkButton";
import type {
  SceneLocation,
  ReachableLocation,
  VisibleNpc,
  InvestigableClue,
} from "../../types/api";

interface ActionColumnProps {
  currentLocation: SceneLocation;
  reachableLocations: ReachableLocation[];
  visibleNpcs: VisibleNpc[];
  investigableClues: InvestigableClue[];
  discoveredClueCount: number;
  visitedLocationCount: number;
  onMove: (locationKey: string) => void;
  onTalkNpc: (npcKey: string) => void;
  onInvestigate: () => void;
  onViewPlayerProfile?: () => void;
  activeNpcKey?: string;
  loading?: boolean;
}

export function ActionColumn({
  currentLocation,
  reachableLocations,
  visibleNpcs,
  investigableClues,
  discoveredClueCount,
  visitedLocationCount,
  onMove,
  onTalkNpc,
  onInvestigate,
  onViewPlayerProfile,
  activeNpcKey,
  loading,
}: ActionColumnProps) {
  return (
    <aside className="h-full bg-(--bg-primary) border-r border-(--border-color) overflow-y-auto p-4 space-y-6">
      {/* 玩家资料卡 */}
      <section>
        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
          侦探档案
        </h3>
        <div
          onClick={onViewPlayerProfile}
          className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg cursor-pointer hover:border-(--accent-primary) transition-all duration-300 hover:shadow-lg hover:shadow-(--accent-primary)/10 group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-(--accent-primary)/20 border border-(--accent-primary)/40 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-(--accent-primary)"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <div className="font-heading text-base text-(--text-primary)">
                侦探
              </div>
              <div className="text-xs text-(--accent-primary)">调查中</div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-(--text-muted)">持有线索</span>
              <span className="text-(--accent-primary)">
                {discoveredClueCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--text-muted)">已访问地点</span>
              <span className="text-(--text-primary)">
                {visitedLocationCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 当前地点卡 */}
      <section>
        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
          当前地点
        </h3>
        <div className="p-3 bg-(--bg-secondary) border border-(--border-color) rounded-lg">
          <h4 className="font-heading text-base text-(--text-primary) mb-1">
            {currentLocation.name}
          </h4>
          <p className="text-xs text-(--text-secondary) line-clamp-2">
            {currentLocation.description ?? ""}
          </p>
        </div>
      </section>

      {/* 调查按钮 */}
      <section>
        <InkButton
          variant="default"
          size="sm"
          className="w-full"
          onClick={onInvestigate}
          loading={loading}
        >
          调查当前地点
        </InkButton>
      </section>

      {/* 可前往地点 */}
      {reachableLocations.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
            前往地点
          </h3>
          <div className="space-y-2">
            {reachableLocations.map((location) => (
              <InkButton
                key={location.key}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => onMove(location.key)}
                loading={loading}
              >
                <span className="truncate">{location.name}</span>
              </InkButton>
            ))}
          </div>
        </section>
      )}

      {/* 可询问NPC */}
      {visibleNpcs.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
            询问对象
          </h3>
          <div className="space-y-2">
            {visibleNpcs.map((npc) => (
              <div
                key={npc.key}
                onClick={() => !loading && onTalkNpc(npc.key)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  activeNpcKey === npc.key
                    ? "bg-(--bg-tertiary) border-(--accent-primary)"
                    : "bg-(--bg-secondary) border-(--border-color)"
                } ${loading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer hover:border-(--border-hover)"}`}
              >
                <div className="w-10 h-10 rounded-full bg-(--bg-primary) border border-(--border-color) flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-(--text-muted)"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="font-medium text-(--text-primary) truncate">
                  {npc.display_name}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 可调查线索 */}
      {investigableClues.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
            可调查线索
          </h3>
          <div className="space-y-2">
            {investigableClues.map((clue) => (
              <div
                key={clue.key}
                onClick={() => !loading && onInvestigate()}
                className={`flex items-center gap-3 p-3 rounded-lg border bg-(--bg-secondary) border-(--border-color) transition-all duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer hover:border-(--accent-primary)"
                }`}
              >
                <div className="w-10 h-10 rounded bg-(--bg-primary) border border-(--border-color) flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-(--text-muted)"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-(--text-primary) truncate">
                    {clue.name}
                  </div>
                  <div className="text-xs text-(--text-muted)">
                    {clue.clue_type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
