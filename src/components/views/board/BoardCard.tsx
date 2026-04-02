// src/components/views/board/BoardCard.tsx
import type { BoardElement, BoardElementType } from '../../../types/board';

interface BoardCardProps {
  element: BoardElement;
  isSelected: boolean;
  isConnecting: boolean;
  isConnectionTarget?: boolean;
}

export function BoardCard({
  element,
  isSelected,
  isConnecting,
  isConnectionTarget,
}: BoardCardProps) {
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
      data-board-id={element.id}
      data-element-type={element.type}
      className={`board-card ${getCardClass(element.type)} ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''} ${isConnectionTarget ? 'connection-target' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        transform: `rotate(${element.rotation || 0}deg)`,
        '--rotation': `${element.rotation || 0}deg`,
      } as React.CSSProperties}
    >
      {/* 连接点 */}
      <div
        className="connection-point top"
        data-connection-point="top"
        data-board-id={element.id}
      />
      <div
        className="connection-point right"
        data-connection-point="right"
        data-board-id={element.id}
      />
      <div
        className="connection-point bottom"
        data-connection-point="bottom"
        data-board-id={element.id}
      />
      <div
        className="connection-point left"
        data-connection-point="left"
        data-board-id={element.id}
      />

      {/* 卡片内容 */}
      <div className="card-title">{element.title}</div>
      {element.type === 'note' ? (
        <textarea
          className="card-content"
          defaultValue={element.content}
          placeholder="写下你的想法..."
          data-note-input
          data-board-id={element.id}
        />
      ) : (
        <div className="card-content">{element.content}</div>
      )}
    </div>
  );
}
