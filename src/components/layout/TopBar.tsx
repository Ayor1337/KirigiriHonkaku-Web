// src/components/layout/TopBar.tsx
import { TimeDisplay } from '../ui/TimeDisplay';
import { RiskIndicator } from '../ui/RiskIndicator';
import type { GameState } from '../../types/game';

interface TopBarProps {
  gameState: GameState;
}

export function TopBar({ gameState }: TopBarProps) {
  return (
    <header className="h-15 bg-(--bg-secondary) border-b border-(--border-color) px-6 flex items-center justify-between shrink-0">
      {/* 左侧：时间 */}
      <TimeDisplay
        date={gameState.currentTime}
        timePeriod={gameState.timePeriod}
        weather={gameState.weather}
      />

      {/* 中间：局势提示 */}
      <div className="hidden md:flex items-center max-w-md px-6">
        <span className="text-sm text-(--text-secondary) text-center line-clamp-1">
          {gameState.situation}
        </span>
      </div>

      {/* 右侧：风险指示器 */}
      <RiskIndicator level={gameState.exposureLevel} />
    </header>
  );
}
