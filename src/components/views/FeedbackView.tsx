import { useEffect, useState } from 'react';
import { ClueCard } from '../ui/ClueCard';
import { InkButton } from '../ui/InkButton';
import type { Item, Clue, Location, NPC } from '../../types/game';

interface FeedbackViewProps {
  item: Item;
  result: {
    description: string;
    cluesFound: Clue[];
    timeAdvanced: number;
    newLocations?: Location[];
    newNPCs?: NPC[];
    exposureChange: number;
  };
  onComplete: () => void;
}

export function FeedbackView({ item, result, onComplete }: FeedbackViewProps) {
  const [showClues, setShowClues] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowClues(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* 标题 */}
      <header>
        <h2 className="text-sm text-(--text-muted) uppercase tracking-wider mb-2">
          调查结果
        </h2>
        <h1 className="font-heading text-2xl text-(--text-primary)">
          {item.name}
        </h1>
      </header>

      {/* 调查结果描述 */}
      <section className="p-6 bg-(--bg-secondary) border border-(--border-color) rounded-lg">
        <p className="text-lg text-(--text-primary) leading-relaxed">
          {result.description}
        </p>
      </section>

      {/* 发现的线索 */}
      {result.cluesFound.length > 0 && (
        <section>
          <h3 className="font-heading text-xl text-(--accent-primary) mb-4 flex items-center gap-2">
            <span>发现的线索</span>
            <span className="text-sm px-2 py-0.5 bg-(--accent-primary) text-white rounded">
              {result.cluesFound.length}
            </span>
          </h3>
          <div className="space-y-3">
            {result.cluesFound.map((clue, index) => (
              <div 
                key={clue.id}
                style={{ 
                  opacity: showClues ? 1 : 0,
                  transform: showClues ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease ${index * 0.2}s`,
                }}
              >
                <ClueCard clue={clue} isNew={true} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 状态变化 */}
      <section className="space-y-3">
        <h3 className="font-heading text-lg text-(--text-primary)">
          状态变化
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 时间推进 */}
          <div className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg">
            <div className="text-sm text-(--text-muted) mb-1">时间推进</div>
            <div className="font-mono text-lg text-(--text-primary)">
              +{result.timeAdvanced} 分钟
            </div>
          </div>

          {/* 暴露度变化 */}
          <div className="p-4 bg-(--bg-secondary) border border-(--border-color) rounded-lg">
            <div className="text-sm text-(--text-muted) mb-1">暴露度变化</div>
            <div className={`font-mono text-lg ${
              result.exposureChange > 0 ? 'text-(--danger)' : 'text-(--success)'
            }`}>
              {result.exposureChange > 0 ? '+' : ''}{result.exposureChange}%
            </div>
          </div>
        </div>

        {/* 解锁内容 */}
        {result.newLocations && result.newLocations.length > 0 && (
          <div className="p-4 bg-(--bg-tertiary) border border-(--accent-primary) rounded-lg">
            <div className="text-sm text-(--accent-primary) mb-2">解锁新地点</div>
            <div className="flex flex-wrap gap-2">
              {result.newLocations.map(loc => (
                <span key={loc.id} className="text-(--text-primary)">{loc.name}</span>
              ))}
            </div>
          </div>
        )}

        {result.newNPCs && result.newNPCs.length > 0 && (
          <div className="p-4 bg-(--bg-tertiary) border border-(--accent-primary) rounded-lg">
            <div className="text-sm text-(--accent-primary) mb-2">新增可询问对象</div>
            <div className="flex flex-wrap gap-2">
              {result.newNPCs.map(npc => (
                <span key={npc.id} className="text-(--text-primary)">{npc.name}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 完成按钮 */}
      <div className="pt-4">
        <InkButton size="lg" className="w-full" onClick={onComplete}>
          继续调查
        </InkButton>
      </div>
    </div>
  );
}
