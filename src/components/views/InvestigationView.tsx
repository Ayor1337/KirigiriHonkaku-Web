// src/components/views/InvestigationView.tsx
import type { GameState, Item, NPC } from '../../types/game';

interface InvestigationViewProps {
  gameState: GameState;
  onSelectNPC: (npc: NPC) => void;
  onSelectItem: (item: Item) => void;
}

export function InvestigationView({
  gameState,
  onSelectNPC,
  onSelectItem,
}: InvestigationViewProps) {
  const uninvestigatedItems = gameState.availableItems.filter(i => !i.isInvestigated);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* 地点标题 */}
      <header>
        <h1 className="font-heading text-3xl text-(--text-primary) mb-2">
          {gameState.currentLocation.name}
        </h1>
        <div className="flex items-center gap-3 text-sm text-(--text-secondary)">
          <span>{gameState.timePeriod}</span>
          <span className="text-(--border-color)">·</span>
          <span>{gameState.weather}</span>
        </div>
      </header>

      {/* 场景描述 */}
      <section className="prose prose-invert max-w-none">
        <p className="text-lg text-(--text-primary) leading-relaxed">
          {gameState.currentLocation.description}
        </p>
      </section>

      {/* 在场人物摘要 */}
      {gameState.presentNPCs.length > 0 && (
        <section>
          <h2 className="font-heading text-xl text-(--accent-primary) mb-4">
            在场人物
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gameState.presentNPCs.map((npc) => (
              <div
                key={npc.id}
                onClick={() => onSelectNPC(npc)}
                className="flex items-center gap-3 p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg cursor-pointer hover:border-(--accent-primary) transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-(--bg-primary) border border-(--border-color) flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-(--text-muted)" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-(--text-primary)">{npc.name}</div>
                  <div className="text-sm text-(--text-muted)">{npc.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 可调查物品摘要 */}
      {uninvestigatedItems.length > 0 && (
        <section>
          <h2 className="font-heading text-xl text-(--accent-primary) mb-4">
            值得关注的物品
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uninvestigatedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg cursor-pointer hover:border-(--accent-primary) transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-(--accent-primary)" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  <span className="font-medium text-(--text-primary)">{item.name}</span>
                </div>
                <p className="text-sm text-(--text-secondary)">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 局势提示 */}
      <section className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg">
        <h3 className="text-sm font-medium text-(--text-muted) uppercase tracking-wider mb-2">
          当前局势
        </h3>
        <p className="text-(--text-primary)">
          {gameState.situation}
        </p>
      </section>
    </div>
  );
}
