// src/components/views/InvestigationView.tsx
import { InkButton } from "../ui/InkButton";
import type {
  SceneLocation,
  VisibleNpc,
  InvestigableClue,
} from "../../types/api";

interface InvestigationViewProps {
  currentLocation: SceneLocation;
  visibleNpcs: VisibleNpc[];
  investigableClues: InvestigableClue[];
  narrativeText?: string | null;
  onTalkNpc: (npcKey: string) => void;
  onInvestigate: () => void;
  loading?: boolean;
}

export function InvestigationView({
  currentLocation,
  visibleNpcs,
  investigableClues,
  narrativeText,
  onTalkNpc,
  onInvestigate,
  loading,
}: InvestigationViewProps) {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* 地点标题 */}
      <header>
        <h1 className="font-heading text-3xl text-(--text-primary) mb-2">
          {currentLocation.name}
        </h1>
      </header>

      {/* 场景描述 */}
      <section className="prose prose-invert max-w-none">
        <p className="text-lg text-(--text-primary) leading-relaxed">
          {currentLocation.description ?? "你环顾四周，感受着这个地方的氛围..."}
        </p>
      </section>

      {/* 叙事文本 */}
      {narrativeText && (
        <section className="p-4 bg-(--bg-secondary) border border-(--accent-primary)/30 rounded-lg">
          <p className="text-(--text-primary) leading-relaxed italic">
            {narrativeText}
          </p>
        </section>
      )}

      {/* 调查按钮 */}
      <section>
        <InkButton
          variant="default"
          size="lg"
          className="w-full"
          onClick={onInvestigate}
          loading={loading}
        >
          调查此地
        </InkButton>
      </section>

      {/* 在场人物 */}
      {visibleNpcs.length > 0 && (
        <section>
          <h2 className="font-heading text-xl text-(--accent-primary) mb-4">
            在场人物
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleNpcs.map((npc) => (
              <div
                key={npc.key}
                onClick={() => !loading && onTalkNpc(npc.key)}
                className={`flex items-center gap-3 p-4 bg-(--bg-secondary) border rounded-lg transition-colors ${
                  loading ? "border-(--border-color) opacity-50 cursor-not-allowed pointer-events-none" : "border-(--border-color) cursor-pointer hover:border-(--accent-primary)"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-(--bg-primary) border border-(--border-color) flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-(--text-muted)"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-(--text-primary)">
                    {npc.display_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 可调查线索 */}
      {investigableClues.length > 0 && (
        <section>
          <h2 className="font-heading text-xl text-(--accent-primary) mb-4">
            值得关注的线索
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {investigableClues.map((clue) => (
              <div
                key={clue.key}
                onClick={() => !loading && onInvestigate()}
                className={`p-4 bg-(--bg-secondary) border rounded-lg transition-colors ${
                  loading ? "border-(--border-color) opacity-50 cursor-not-allowed pointer-events-none" : "border-(--border-color) cursor-pointer hover:border-(--accent-primary)"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
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
                    {clue.name}
                  </span>
                </div>
                <p className="text-sm text-(--text-secondary)">
                  {clue.clue_type}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
