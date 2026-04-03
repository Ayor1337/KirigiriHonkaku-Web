// src/components/layout/IntelBar.tsx
import type { ViewState } from '../../types/game';

interface IntelBarProps {
  unreadClues?: number;
  mapPoints?: number;
  connectableClues?: number;
  activeNavId?: string;
  onNavigate?: (view: ViewState, navId: string) => void;
}

export function IntelBar({
  unreadClues = 0,
  mapPoints = 0,
  connectableClues = 0,
  activeNavId = 'map',
  onNavigate,
}: IntelBarProps) {
  const navItems = [
    { id: 'map', label: '地图', icon: '🗺️', badge: mapPoints > 0 ? mapPoints : undefined, view: 'map' as ViewState },
    { id: 'clues', label: '线索册', icon: '📋', badge: unreadClues > 0 ? unreadClues : undefined, view: 'investigation' as ViewState },
    { id: 'board', label: '侦探板', icon: '🧩', badge: connectableClues > 0 ? connectableClues : undefined, view: 'board' as ViewState },
    { id: 'records', label: '对话记录', icon: '📝', view: 'dialogue' as ViewState },
  ];

  return (
    <nav className="h-12.5 bg-(--bg-secondary) border-t border-(--border-color) px-6 flex items-center justify-center gap-4 shrink-0">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate?.(item.view, item.id)}
          className={`
            relative flex items-center gap-2 px-4 py-2 text-sm transition-colors rounded-md
            ${activeNavId === item.id
              ? 'text-(--accent-primary) bg-(--accent-primary)/10'
              : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-tertiary)'
            }
          `}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
          {item.badge !== undefined && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-(--accent-primary) text-white rounded-full">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
