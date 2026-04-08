import { getClueTypeLabel } from "../../types/api";
import type {
  VisibleNpc,
  SceneLocation,
  ReachableLocation,
  SessionNpc,
  DialogueDetail,
} from "../../types/api";
import type { DiscoveredClue } from "../../hooks/useGameSession";

type ViewState =
  | "investigation"
  | "dialogue"
  | "feedback"
  | "board"
  | "map"
  | "profile";

interface CaseColumnProps {
  viewState: ViewState;
  visibleNpcs: VisibleNpc[];
  discoveredClues: DiscoveredClue[];
  newClueKeys?: string[];
  onTalkNpc: (npcKey: string) => void;
  narrativeText?: string | null;
  loading?: boolean;
  currentLocation: SceneLocation;
  reachableLocations: ReachableLocation[];
  npcs: SessionNpc[];
  weather?: string | null;
  discoveredClueCount?: number;
  visitedLocationCount?: number;
  exposureLevel?: string;
  activeNpcKey?: string;
  currentDialogue?: DialogueDetail | null;
}

export function CaseColumn({
  viewState,
  visibleNpcs,
  discoveredClues,
  newClueKeys = [],
  onTalkNpc,
  narrativeText,
  loading,
  currentLocation,
  reachableLocations,
  npcs,
  weather,
  discoveredClueCount,
  visitedLocationCount,
  exposureLevel,
  activeNpcKey,
  currentDialogue,
}: CaseColumnProps) {
  const renderSectionTitle = (title: string) => (
    <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
      {title}
    </h3>
  );

  const renderNpcButton = (npc: VisibleNpc) => (
    <button
      key={npc.key}
      disabled={loading}
      onClick={() => onTalkNpc(npc.key)}
      className={`flex items-center gap-2 px-3 py-2 bg-(--bg-secondary) border rounded-lg transition-colors ${
        loading
          ? "border-(--border-color) opacity-50 cursor-not-allowed"
          : "border-(--border-color) hover:border-(--accent-primary)"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 text-(--text-muted)"
        fill="currentColor"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      <span className="text-sm text-(--text-primary)">{npc.display_name}</span>
    </button>
  );

  const renderClueList = (limit?: number) => {
    const clues = limit
      ? discoveredClues.slice(-limit).reverse()
      : discoveredClues.slice(-5).reverse();
    return (
      <div className="space-y-3">
        {clues.map((clue) => (
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
            <div className="text-xs text-(--text-muted)">{getClueTypeLabel(clue.clue_type)}</div>
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
    );
  };

  const renderRecentNarrative = () =>
    narrativeText ? (
      <section>
        {renderSectionTitle("最近动态")}
        <div className="text-sm text-(--text-secondary) pl-3 border-l-2 border-(--border-color) leading-relaxed">
          {narrativeText}
        </div>
      </section>
    ) : null;

  const renderPresentNpcs = () =>
    visibleNpcs.length > 0 ? (
      <section>
        {renderSectionTitle("在场人物")}
        <div className="flex flex-wrap gap-2">
          {visibleNpcs.map(renderNpcButton)}
        </div>
      </section>
    ) : null;

  // ========== investigation / feedback ==========
  if (viewState === "investigation" || viewState === "feedback") {
    return (
      <aside className="h-full bg-(--bg-primary) border-l border-(--border-color) overflow-y-auto p-4 space-y-6">
        {renderPresentNpcs()}

        <section>
          {renderSectionTitle("已发现线索")}
          {renderClueList()}
        </section>

        {renderRecentNarrative()}
      </aside>
    );
  }

  // ========== board ==========
  if (viewState === "board") {
    return (
      <aside className="h-full bg-(--bg-primary) border-l border-(--border-color) overflow-y-auto p-4 space-y-6">
        <section>
          {renderSectionTitle("侦探板动态")}
          <div className="p-3 bg-(--bg-secondary) border border-(--border-color) rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-(--text-muted)">板上元素</span>
              <span className="text-(--text-primary)">
                {discoveredClues.length + 2}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-(--text-muted)">线索卡片</span>
              <span className="text-(--accent-primary)">
                {discoveredClues.length}
              </span>
            </div>
          </div>
        </section>

        <section>
          {renderSectionTitle("最新线索")}
          {renderClueList(3)}
        </section>

        {renderRecentNarrative()}
      </aside>
    );
  }

  // ========== map ==========
  if (viewState === "map") {
    return (
      <aside className="h-full bg-(--bg-primary) border-l border-(--border-color) overflow-y-auto p-4 space-y-6">
        <section>
          {renderSectionTitle("当前地点")}
          <div className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg space-y-2">
            <h4 className="font-heading text-base text-(--text-primary)">
              {currentLocation.name}
            </h4>
            <p className="text-xs text-(--text-secondary) leading-relaxed">
              {currentLocation.description ?? "此处没有更多描述。"}
            </p>
            {weather && (
              <div className="pt-2 border-t border-(--border-color) flex items-center gap-2 text-xs text-(--text-muted)">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 15h18M3 12h18M3 9h18" />
                </svg>
                <span>天气：{weather}</span>
              </div>
            )}
          </div>
        </section>

        {reachableLocations.length > 0 && (
          <section>
            {renderSectionTitle("可前往地点")}
            <div className="space-y-2">
              {reachableLocations.map((loc) => (
                <div
                  key={loc.key}
                  className="flex items-center gap-2 px-3 py-2 bg-(--bg-secondary) border border-(--border-color) rounded-lg text-sm text-(--text-primary)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
                  {loc.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {renderPresentNpcs()}
      </aside>
    );
  }

  // ========== dialogue ==========
  if (viewState === "dialogue") {
    const activeNpc = npcs.find((n) => n.character_id === activeNpcKey);
    const metNpcs = npcs.filter((n) => n.has_met_player);

    return (
      <aside className="h-full bg-(--bg-primary) border-l border-(--border-color) overflow-y-auto p-4 space-y-5">
        {/* A. NPC 资料卡 */}
        {activeNpc && (
          <section>
            {renderSectionTitle("当前对话")}
            <div className="p-3 bg-(--bg-secondary) border border-(--border-color) rounded-lg space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-(--bg-primary) border border-(--border-color) flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-(--text-muted)"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-(--text-primary) truncate">
                    {activeNpc.display_name}
                  </div>
                  {activeNpc.public_identity && (
                    <div className="text-xs text-(--text-muted) truncate">
                      {activeNpc.public_identity}
                    </div>
                  )}
                </div>
              </div>
              {activeNpc.current_location_name && (
                <div className="text-xs text-(--accent-primary) pt-1 border-t border-(--border-color)">
                  位于 {activeNpc.current_location_name}
                </div>
              )}
            </div>
          </section>
        )}

        {/* B. 对话氛围 */}
        {currentDialogue?.tag_flags &&
          Object.keys(currentDialogue.tag_flags).length > 0 && (
            <section>
              {renderSectionTitle("对话氛围")}
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentDialogue.tag_flags).map(([k, v]) => (
                  <span
                    key={k}
                    className="px-2 py-1 text-xs bg-(--bg-secondary) border border-(--border-color) rounded text-(--text-secondary)"
                  >
                    {k}: {v}
                  </span>
                ))}
              </div>
            </section>
          )}

        {/* C. 话题提示 */}
        {discoveredClues.length > 0 && (
          <section>
            {renderSectionTitle("话题提示")}
            <div className="space-y-2">
              {discoveredClues
                .slice(-4)
                .reverse()
                .map((clue) => (
                  <button
                    key={clue.key}
                    disabled={loading}
                    onClick={() =>
                      activeNpcKey && onTalkNpc(activeNpcKey)
                    }
                    className={`w-full text-left px-3 py-2 bg-(--bg-secondary) border border-(--border-color) rounded-lg transition-colors ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-(--accent-primary)"
                    }`}
                  >
                    <div className="text-xs text-(--accent-primary) mb-0.5 truncate">
                      {clue.name}
                    </div>
                    <div className="text-[11px] text-(--text-muted) truncate">
                      试试问关于这条线索的事...
                    </div>
                  </button>
                ))}
            </div>
          </section>
        )}

        {/* D. 对话过的人（紧凑列表） */}
        <section>
          {renderSectionTitle("对话过的人")}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {metNpcs.map((npc) => (
              <button
                key={npc.character_id}
                disabled={loading || npc.character_id === activeNpcKey}
                onClick={() => onTalkNpc(npc.character_id)}
                className={`w-full text-left flex items-center gap-2 px-2 py-2 bg-(--bg-secondary) border rounded-lg transition-colors ${
                  npc.character_id === activeNpcKey
                    ? "border-(--accent-primary) opacity-80"
                    : "border-(--border-color) hover:border-(--accent-primary)"
                }`}
              >
                <span className="text-sm text-(--text-primary) truncate">
                  {npc.display_name}
                </span>
              </button>
            ))}
            {metNpcs.length === 0 && (
              <p className="text-sm text-(--text-muted) italic">
                尚未与任何人交谈...
              </p>
            )}
          </div>
        </section>
      </aside>
    );
  }

  // ========== profile ==========
  if (viewState === "profile") {
    return (
      <aside className="h-full bg-(--bg-primary) border-l border-(--border-color) overflow-y-auto p-4 space-y-6">
        <section>
          {renderSectionTitle("侦探档案")}
          <div className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-(--text-muted)">当前地点</span>
              <span className="text-(--text-primary)">
                {currentLocation.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-(--text-muted)">持有线索</span>
              <span className="text-(--accent-primary)">
                {discoveredClueCount ?? 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-(--text-muted)">已访问地点</span>
              <span className="text-(--text-primary)">
                {visitedLocationCount ?? 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-(--text-muted)">暴露等级</span>
              <span className="text-(--text-primary)">
                {exposureLevel ?? "未知"}
              </span>
            </div>
          </div>
        </section>

        {renderRecentNarrative()}
      </aside>
    );
  }

  // fallback — should not reach here
  return (
    <aside className="h-full bg-(--bg-primary) border-l border-(--border-color) overflow-y-auto p-4 space-y-6">
      {renderPresentNpcs()}
      <section>{renderSectionTitle("已发现线索")}{renderClueList()}</section>
      {renderRecentNarrative()}
    </aside>
  );
}
