// src/components/layout/ActionColumn.tsx
import { NPCList } from '../ui/NPCList';
import { ItemList } from '../ui/ItemList';
import { InkButton } from '../ui/InkButton';
import type { GameState, Location, NPC, Item } from '../../types/game';

interface ActionColumnProps {
  gameState: GameState;
  onSelectLocation: (location: Location) => void;
  onSelectNPC: (npc: NPC) => void;
  onSelectItem: (item: Item) => void;
  activeNPCId?: string;
}

export function ActionColumn({
  gameState,
  onSelectLocation,
  onSelectNPC,
  onSelectItem,
  activeNPCId,
}: ActionColumnProps) {
  return (
    <aside className="h-full bg-(--bg-primary) border-r border-(--border-color) overflow-y-auto p-4 space-y-6">
      {/* 玩家资料卡 */}
      <section>
        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
          侦探档案
        </h3>
        <div className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-(--accent-primary)/20 border border-(--accent-primary)/40 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-(--accent-primary)" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div>
              <div className="font-heading text-base text-(--text-primary)">雾切响子</div>
              <div className="text-xs text-(--accent-primary)">超高校级的侦探</div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-(--text-muted)">状态</span>
              <span className="text-(--text-primary)">调查中</span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--text-muted)">持有线索</span>
              <span className="text-(--accent-primary)">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--text-muted)">探索地点</span>
              <span className="text-(--text-primary)">5/11</span>
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
            {gameState.currentLocation.name}
          </h4>
          <p className="text-xs text-(--text-secondary) line-clamp-2">
            {gameState.currentLocation.description.slice(0, 60)}...
          </p>
        </div>
      </section>

      {/* 可前往地点 */}
      <section>
        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
          前往地点
        </h3>
        <div className="space-y-2">
          {gameState.availableLocations.map((location) => (
            <InkButton
              key={location.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => onSelectLocation(location)}
            >
              <span className="truncate">{location.name}</span>
            </InkButton>
          ))}
        </div>
      </section>

      {/* 可询问NPC */}
      <section>
        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
          询问对象
        </h3>
        <NPCList
          npcs={gameState.presentNPCs}
          onSelectNPC={onSelectNPC}
          activeNPCId={activeNPCId}
        />
      </section>

      {/* 可调查物品 */}
      <section>
        <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--accent-primary)" />
          调查物品
        </h3>
        <ItemList
          items={gameState.availableItems}
          onSelectItem={onSelectItem}
        />
      </section>
    </aside>
  );
}
