// src/components/views/board/BoardConnections.tsx
import type { BoardConnection, BoardElement } from '../../../types/board';

interface BoardConnectionsProps {
  connections: BoardConnection[];
  elements: BoardElement[];
  previewLine: { fromX: number; fromY: number; toX: number; toY: number } | null;
  onDeleteConnection?: (id: string) => void;
}

export function BoardConnections({
  connections,
  elements,
  previewLine,
  onDeleteConnection,
}: BoardConnectionsProps) {
  // 计算卡片中心点
  const getElementCenter = (elementId: string) => {
    const element = elements.find(e => e.id === elementId);
    if (!element) return null;

    const width = element.type === 'note' ? 150 : element.type === 'npc' ? 160 : 180;
    const height = element.type === 'location' ? 140 : 100;

    return {
      x: element.x + width / 2,
      y: element.y + height / 2,
    };
  };

  return (
    <svg className="connections-layer">
      {/* 已建立的连接 */}
      {connections.map(conn => {
        const from = getElementCenter(conn.fromId);
        const to = getElementCenter(conn.toId);
        if (!from || !to) return null;

        return (
          <line
            key={conn.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="connection-line"
            onClick={() => onDeleteConnection?.(conn.id)}
          />
        );
      })}

      {/* 预览线 */}
      {previewLine && (
        <line
          x1={previewLine.fromX}
          y1={previewLine.fromY}
          x2={previewLine.toX}
          y2={previewLine.toY}
          className="connection-line drawing"
        />
      )}
    </svg>
  );
}
