// src/components/views/board/BoardConnections.tsx
import type { BoardElement, BoardConnection } from '../../../types/board';

interface BoardConnectionsProps {
  connections: BoardConnection[];
  elements: BoardElement[];
  drawingLine?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null;
  onDeleteConnection?: (id: string) => void;
}

export function BoardConnections({
  connections,
  elements,
  drawingLine,
  onDeleteConnection,
}: BoardConnectionsProps) {
  const getElementCenter = (elementId: string) => {
    const element = elements.find(e => e.id === elementId);
    if (!element) return null;

    // 估算卡片中心（实际应用中应该使用 ref 获取精确尺寸）
    const width = element.type === 'note' ? 150 : element.type === 'npc' ? 160 : 180;
    const height = element.type === 'note' ? 100 : 100;

    return {
      x: element.x + width / 2,
      y: element.y + height / 2,
    };
  };

  const createPath = (x1: number, y1: number, x2: number, y2: number) => {
    // 使用贝塞尔曲线创建平滑连接线
    const midX = (x1 + x2) / 2;
    const controlX1 = midX;
    const controlY1 = y1;
    const controlX2 = midX;
    const controlY2 = y2;

    return `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;
  };

  return (
    <svg className="connections-layer interactive" style={{ width: '100%', height: '100%' }}>
      <defs>
        {/* 箭头标记 */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-primary)" opacity="0.8" />
        </marker>
      </defs>

      {/* 已存在的连接 */}
      {connections.map((connection) => {
        const from = getElementCenter(connection.fromId);
        const to = getElementCenter(connection.toId);

        if (!from || !to) return null;

        const path = createPath(from.x, from.y, to.x, to.y);
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        return (
          <g key={connection.id}>
            {/* 连接线 */}
            <path
              d={path}
              className="connection-line"
              stroke={connection.color || 'var(--accent-primary)'}
              onClick={() => onDeleteConnection?.(connection.id)}
            />
            {/* 标签背景 */}
            {connection.label && (
              <>
                <rect
                  x={midX - 40}
                  y={midY - 10}
                  width="80"
                  height="20"
                  rx="4"
                  className="connection-label-bg"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  className="connection-label"
                >
                  {connection.label}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* 正在绘制的线 */}
      {drawingLine && (
        <path
          d={createPath(
            drawingLine.fromX,
            drawingLine.fromY,
            drawingLine.toX,
            drawingLine.toY
          )}
          className="connection-line drawing"
        />
      )}
    </svg>
  );
}
