// src/components/ui/ItemList.tsx
import type { Item } from '../../types/game';

interface ItemListProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
}

export function ItemList({ items, onSelectItem }: ItemListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
            item.isInvestigated
              ? 'bg-(--bg-tertiary) border-(--border-color) opacity-70'
              : 'bg-(--bg-secondary) border-(--border-color) hover:border-(--accent-primary)'
          }`}
          onClick={() => onSelectItem(item)}
        >
          {/* 物品图标 */}
          <div className="w-10 h-10 rounded bg-(--bg-primary) border border-(--border-color) flex items-center justify-center flex-shrink-0">
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
            <div className={`font-medium truncate ${
              item.isInvestigated ? 'text-(--text-muted)' : 'text-(--text-primary)'
            }`}>
              {item.name}
            </div>
            <div className="text-xs text-(--text-muted) truncate">
              {item.description}
            </div>
          </div>

          {item.isInvestigated && (
            <span className="text-xs text-[var(--success)] px-2 py-0.5 bg-(--bg-primary) rounded">
              已调查
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
