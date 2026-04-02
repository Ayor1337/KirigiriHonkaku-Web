// src/components/layout/CaseColumn.tsx
import { ClueCard } from '../ui/ClueCard';
import type { GameState, NPC } from '../../types/game';

interface CaseColumnProps {
  gameState: GameState;
  onSelectNPC: (npc: NPC) => void;
  newClueIds?: string[];
}

export function CaseColumn({ gameState, onSelectNPC, newClueIds = [] }: CaseColumnProps) {
  return (
    <aside className="h-full bg-[var(--bg-primary)] border-l border-[var(--border-color)] overflow-y-auto p-4 space-y-6">
      {/* 在场NPC */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          在场人物
        </h3>
        <div className="flex flex-wrap gap-2">
          {gameState.presentNPCs.filter(n => n.isPresent).map((npc) => (
            <button
              key={npc.id}
              onClick={() => onSelectNPC(npc)}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-primary)] transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-[var(--text-muted)]"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span className="text-sm text-[var(--text-primary)]">{npc.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 最新线索 */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          最新线索
        </h3>
        <div className="space-y-3">
          {gameState.discoveredClues.slice(0, 3).map((clue) => (
            <ClueCard
              key={clue.id}
              clue={clue}
              isNew={newClueIds.includes(clue.id)}
            />
          ))}
          {gameState.discoveredClues.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic">
              尚未发现任何线索...
            </p>
          )}
        </div>
      </section>

      {/* 最近事件 */}
      <section>
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          最近事件
        </h3>
        <div className="space-y-2">
          {gameState.recentEvents.slice(-5).map((event, index) => (
            <div
              key={index}
              className="text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[var(--border-color)]"
            >
              {event}
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
