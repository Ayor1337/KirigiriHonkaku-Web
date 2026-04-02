// src/components/ui/NPCList.tsx

import type { NPC } from '../../types/game';

interface NPCListProps {
  npcs: NPC[];
  onSelectNPC: (npc: NPC) => void;
  activeNPCId?: string;
}

export function NPCList({ npcs, onSelectNPC, activeNPCId }: NPCListProps) {
  return (
    <div className="space-y-2">
      {npcs.map((npc) => (
        <div
          key={npc.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
            activeNPCId === npc.id
              ? 'bg-[var(--bg-tertiary)] border-[var(--accent-primary)]'
              : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)]'
          }`}
          onClick={() => onSelectNPC(npc)}
        >
          {/* 剪影头像 */}
          <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-[var(--text-muted)]"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-[var(--text-primary)] truncate">
              {npc.name}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {npc.title}
            </div>
          </div>

          {!npc.dialogueAvailable && (
            <span className="text-xs text-[var(--text-muted)] px-2 py-0.5 bg-[var(--bg-primary)] rounded">
              沉默
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
