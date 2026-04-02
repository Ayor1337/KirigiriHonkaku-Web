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
