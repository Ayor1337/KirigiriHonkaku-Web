// src/components/views/board/DraggableCard.tsx
import { useState, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import type { BoardElement, BoardElementType } from '../../../types/board';

interface DraggableCardProps {
  element: BoardElement;
  isSelected: boolean;
  isConnecting: boolean;
  isConnectionTarget?: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onStartConnection: (point: 'top' | 'right' | 'bottom' | 'left') => void;
  onConnectionTargetChange?: (isTarget: boolean) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function DraggableCard({
  element,
  isSelected,
  isConnecting,
  isConnectionTarget,
  onSelect,
  onMove,
  onStartConnection,
  onConnectionTargetChange,
  onContextMenu,
}: DraggableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).classList.contains('connection-point')) {
      return; // 让连接点事件冒泡
    }

    e.stopPropagation();
    onSelect();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [onSelect]);

  const handlePointerMove = useCallback((e: ReactPointerEvent) => {
    if (!isDragging) return;

    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const newX = e.clientX - parentRect.left - dragOffset.x;
    const newY = e.clientY - parentRect.top - dragOffset.y;

    onMove(newX, newY);
  }, [isDragging, dragOffset, onMove]);

  const handlePointerUp = useCallback((e: ReactPointerEvent) => {
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const getCardClass = (type: BoardElementType) => {
    switch (type) {
      case 'clue': return 'card-clue';
      case 'npc': return 'card-npc';
      case 'location': return 'card-location';
      case 'time': return 'card-time';
      case 'note': return 'card-note yellow';
      default: return 'card-clue';
    }
  };

  return (
    <div
      className={`board-card ${getCardClass(element.type)} ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''} ${isConnectionTarget ? 'connection-target' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        transform: `rotate(${element.rotation || 0}deg)`,
        '--rotation': `${element.rotation || 0}deg`,
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={() => onConnectionTargetChange?.(true)}
      onPointerLeave={() => onConnectionTargetChange?.(false)}
      onContextMenu={onContextMenu}
    >
      {/* 连接点 */}
      <div
        className="connection-point top"
        onPointerDown={(e) => { e.stopPropagation(); onStartConnection('top'); }}
      />
      <div
        className="connection-point right"
        onPointerDown={(e) => { e.stopPropagation(); onStartConnection('right'); }}
      />
      <div
        className="connection-point bottom"
        onPointerDown={(e) => { e.stopPropagation(); onStartConnection('bottom'); }}
      />
      <div
        className="connection-point left"
        onPointerDown={(e) => { e.stopPropagation(); onStartConnection('left'); }}
      />

      {/* 卡片内容 */}
      <div className="card-title">{element.title}</div>
      {element.type === 'note' ? (
        <textarea
          className="card-content"
          defaultValue={element.content}
          placeholder="写下你的想法..."
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="card-content">{element.content}</div>
      )}
    </div>
  );
}
