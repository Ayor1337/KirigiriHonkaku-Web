// src/components/layout/IntelBar.tsx
interface IntelBarProps {
  unreadClues?: number;
  mapPoints?: number;
  connectableClues?: number;
}

export function IntelBar({
  unreadClues = 0,
  mapPoints = 0,
  connectableClues = 0,
}: IntelBarProps) {
  const navItems = [
    { id: 'map', label: '地图', icon: '🗺️', badge: mapPoints > 0 ? mapPoints : undefined },
    { id: 'clues', label: '线索册', icon: '📋', badge: unreadClues > 0 ? unreadClues : undefined },
    { id: 'board', label: '侦探板', icon: '🧩', badge: connectableClues > 0 ? connectableClues : undefined },
    { id: 'records', label: '对话记录', icon: '📝' },
  ];

  return (
    <nav className="h-12.5 bg-(--bg-secondary) border-t border-(--border-color) px-6 flex items-center justify-center gap-4 shrink-0">
      {navItems.map((item) => (
        <button
          key={item.id}
          className="relative flex items-center gap-2 px-4 py-2 text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors rounded-md hover:bg-(--bg-tertiary)"
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
