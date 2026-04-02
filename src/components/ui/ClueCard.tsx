// src/components/ui/ClueCard.tsx

import { useState } from 'react';
import type { Clue } from '../../types/game';

interface ClueCardProps {
  clue: Clue;
  isNew?: boolean;
}

export function ClueCard({ clue, isNew = false }: ClueCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`flip-card w-full h-40 cursor-pointer ${isNew ? 'animate-[pulse-glow_0.6s_ease-in-out_2]' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`flip-card-inner relative w-full h-full ${isFlipped ? 'flipped' : ''}`}>
        {/* 正面 */}
        <div className="flip-card-front absolute inset-0 bg-(--bg-secondary) border border-(--border-color) rounded-lg p-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-heading text-lg text-(--accent-primary)">
              {clue.title}
            </h4>
            {isNew && (
              <span className="px-2 py-0.5 text-xs bg-(--accent-primary) text-white rounded">
                新
              </span>
            )}
          </div>
          <p className="text-sm text-(--text-secondary) flex-1">
            {clue.summary}
          </p>
          <div className="text-xs text-(--text-muted) mt-2">
            点击翻转查看详情 →
          </div>
        </div>

        {/* 背面 */}
        <div className="flip-card-back absolute inset-0 bg-(--bg-tertiary) border border-(--accent-primary) rounded-lg p-4 flex flex-col">
          <h4 className="font-heading text-base text-(--accent-primary) mb-2">
            {clue.title}
          </h4>
          <p className="text-sm text-(--text-primary) flex-1 overflow-y-auto">
            {clue.details}
          </p>
          {clue.relatedClues.length > 0 && (
            <div className="mt-2 pt-2 border-t border-(--border-color)">
              <span className="text-xs text-(--text-muted)">
                关联线索: {clue.relatedClues.length} 条
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
