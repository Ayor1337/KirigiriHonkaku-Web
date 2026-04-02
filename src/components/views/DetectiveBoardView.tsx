// src/components/views/DetectiveBoardView.tsx
import { useState, useCallback } from 'react';
import { InkButton } from '../ui/InkButton';
import { BoardCanvas } from './board/BoardCanvas';
import { BoardToolbar } from './board/BoardToolbar';
import type { GameState } from '../../types/game';
import type { BoardElement, BoardConnection } from '../../types/board';
import '../../styles/board.css';

interface DetectiveBoardViewProps {
  gameState: GameState;
  onBack: () => void;
}

export function DetectiveBoardView({ gameState, onBack }: DetectiveBoardViewProps) {
  const [connections, setConnections] = useState<BoardConnection[]>([]);

  // 初始化元素 - 从游戏状态转换
  // 使用伪随机数（基于索引）保证可重现性
  const [elements, setElements] = useState<BoardElement[]>(() => {
    const newElements: BoardElement[] = [];

    // 添加已发现的线索 - 伪随机散落位置
    gameState.discoveredClues.forEach((clue, index) => {
      // 使用基于索引的伪随机偏移
      const offsetX = ((index * 17) % 50); // 0-49 的伪随机数
      const offsetY = ((index * 31) % 50);
      const rotation = ((index * 7) % 8) - 4; // -4 到 4 度

      newElements.push({
        id: `clue-${clue.id}`,
        type: 'clue',
        x: 100 + (index % 3) * 250 + offsetX,
        y: 100 + Math.floor(index / 3) * 150 + offsetY,
        title: clue.title,
        content: clue.summary,
        sourceId: clue.id,
        createdAt: clue.discoveredAt,
        rotation,
      });
    });

    // 添加当前地点
    newElements.push({
      id: 'location-current',
      type: 'location',
      x: 600,
      y: 100,
      title: gameState.currentLocation.name,
      content: gameState.currentLocation.description.slice(0, 60) + '...',
      createdAt: new Date(),
      rotation: -1,
    });

    // 添加在场人物
    gameState.presentNPCs.forEach((npc, index) => {
      const rotation = ((index * 13) % 6) - 3; // -3 到 3 度
      newElements.push({
        id: `npc-${npc.id}`,
        type: 'npc',
        x: 150 + index * 200,
        y: 400,
        title: npc.name,
        content: npc.title,
        sourceId: npc.id,
        createdAt: new Date(),
        rotation,
      });
    });

    // 添加时间
    newElements.push({
      id: 'time-current',
      type: 'time',
      x: 50,
      y: 50,
      title: '时间',
      content: gameState.timePeriod,
      createdAt: new Date(),
    });

    return newElements;
  });

  // 添加便利贴
  const handleAddNote = useCallback(() => {
    const timestamp = Date.now();
    // 使用 timestamp 生成伪随机偏移
    const offsetX = (timestamp % 200);
    const offsetY = ((timestamp >> 3) % 150);
    const rotation = ((timestamp % 12) - 6); // -6 到 6 度

    const newNote: BoardElement = {
      id: `note-${timestamp}`,
      type: 'note',
      x: 300 + offsetX,
      y: 200 + offsetY,
      title: '',
      content: '',
      createdAt: new Date(),
      rotation,
    };
    setElements(prev => [...prev, newNote]);
  }, []);

  // 清空画布
  const handleClearBoard = useCallback(() => {
    // 保留初始化的线索、地点、人物、时间，只删除玩家添加的便利贴和连接
    setElements(prev => prev.filter(el => el.type !== 'note'));
    setConnections([]);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <header className="p-6 border-b border-(--border-color) flex items-center justify-between">
        <div>
          <h2 className="text-sm text-(--text-muted) uppercase tracking-wider mb-1">
            侦探板
          </h2>
          <h1 className="font-heading text-2xl text-(--text-primary)">
            思维空间
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-(--text-muted)">
            {elements.length} 个元素 · {connections.length} 条连接
          </span>
          <InkButton variant="ghost" size="sm" onClick={onBack}>
            ← 返回调查
          </InkButton>
        </div>
      </header>

      {/* 画布区域 */}
      <div className="flex-1 relative overflow-hidden">
        <BoardCanvas
          elements={elements}
          connections={connections}
          onElementsChange={setElements}
          onConnectionsChange={setConnections}
        />

        {/* 工具栏 */}
        <BoardToolbar
          onAddNote={handleAddNote}
          onClearBoard={handleClearBoard}
        />

        {/* 使用提示 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-(--text-muted) bg-(--bg-secondary)/80 backdrop-blur px-4 py-2 rounded-full border border-(--border-color)">
          💡 拖拽移动 · 右键菜单 · 拖拽连接点建立关联
        </div>
      </div>
    </div>
  );
}
