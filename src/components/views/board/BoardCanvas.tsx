// src/components/views/board/BoardCanvas.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { DraggableCard } from './DraggableCard';
import { BoardConnections } from './BoardConnections';
import { ContextMenu } from './ContextMenu';
import type { BoardElement, BoardConnection } from '../../../types/board';

interface BoardCanvasProps {
  elements: BoardElement[];
  connections: BoardConnection[];
  onElementsChange: (elements: BoardElement[]) => void;
  onConnectionsChange: (connections: BoardConnection[]) => void;
}

export function BoardCanvas({
  elements,
  connections,
  onElementsChange,
  onConnectionsChange,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingState, setConnectingState] = useState<{
    fromId: string;
    startX: number;
    startY: number;
  } | null>(null);
  const [drawingLine, setDrawingLine] = useState<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    elementId: string;
  } | null>(null);
  // 追踪连接时的目标元素
  const [connectionTarget, setConnectionTarget] = useState<string | null>(null);

  // 处理元素移动
  const handleMove = useCallback((id: string, x: number, y: number) => {
    const newElements = elements.map(el =>
      el.id === id ? { ...el, x: Math.max(0, x), y: Math.max(0, y) } : el
    );
    onElementsChange(newElements);
  }, [elements, onElementsChange]);

  // 开始连接
  const handleStartConnection = useCallback((elementId: string) => {
    const element = elements.find(e => e.id === elementId);
    if (!element) return;

    const width = element.type === 'note' ? 150 : 180;
    const height = 100;

    const startX = element.x + width / 2;
    const startY = element.y + height / 2;

    setConnectingState({
      fromId: elementId,
      startX,
      startY,
    });
  }, [elements]);

  // 鼠标移动时更新绘制中的线
  useEffect(() => {
    if (!connectingState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setDrawingLine({
        fromX: connectingState.startX,
        fromY: connectingState.startY,
        toX: e.clientX - rect.left,
        toY: e.clientY - rect.top,
      });
    };

    const handleMouseUp = () => {
      // 如果有有效的连接目标，完成连接
      if (connectionTarget && connectingState && connectionTarget !== connectingState.fromId) {
        const newConnection: BoardConnection = {
          id: `conn-${Date.now()}`,
          fromId: connectingState.fromId,
          toId: connectionTarget,
          color: 'var(--accent-primary)',
          createdAt: new Date(),
        };
        onConnectionsChange([...connections, newConnection]);
      }
      setConnectingState(null);
      setDrawingLine(null);
      setConnectionTarget(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [connectingState, connectionTarget, connections, onConnectionsChange]);

  // 设置连接目标（当鼠标悬停在卡片上时）
  const handleConnectionTarget = useCallback((elementId: string | null) => {
    if (connectingState) {
      setConnectionTarget(elementId);
    }
  }, [connectingState]);

  // 删除连接
  const handleDeleteConnection = useCallback((id: string) => {
    onConnectionsChange(connections.filter(c => c.id !== id));
  }, [connections, onConnectionsChange]);

  // 删除元素
  const handleDeleteElement = useCallback(() => {
    if (!contextMenu) return;
    onElementsChange(elements.filter(e => e.id !== contextMenu.elementId));
    onConnectionsChange(connections.filter(
      c => c.fromId !== contextMenu.elementId && c.toId !== contextMenu.elementId
    ));
    setContextMenu(null);
    if (selectedId === contextMenu.elementId) setSelectedId(null);
  }, [contextMenu, elements, connections, onElementsChange, onConnectionsChange, selectedId]);

  // 置于顶层
  const handleBringToFront = useCallback(() => {
    if (!contextMenu) return;
    const element = elements.find(e => e.id === contextMenu.elementId);
    if (element) {
      onElementsChange([
        ...elements.filter(e => e.id !== contextMenu.elementId),
        element,
      ]);
    }
    setContextMenu(null);
  }, [contextMenu, elements, onElementsChange]);

  // 处理右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, elementId });
    setSelectedId(elementId);
  }, []);

  // 点击画布空白处取消选择
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedId(null);
      setContextMenu(null);
    }
  }, []);

  return (
    <div
      ref={canvasRef}
      className={`board-canvas ${connectingState ? 'connecting' : ''}`}
      onClick={handleCanvasClick}
    >
      {/* 网格背景 */}
      <div className="board-grid" />

      {/* 连接线层 */}
      <BoardConnections
        connections={connections}
        elements={elements}
        drawingLine={drawingLine}
        onDeleteConnection={handleDeleteConnection}
      />

      {/* 元素卡片层 */}
      {elements.map((element, index) => (
        <DraggableCard
          key={element.id}
          element={{ ...element, rotation: element.rotation || (index % 3 - 1) * 2 }}
          isSelected={selectedId === element.id}
          isConnecting={connectingState?.fromId === element.id}
          isConnectionTarget={connectionTarget === element.id && connectionTarget !== connectingState?.fromId}
          onSelect={() => setSelectedId(element.id)}
          onMove={(x, y) => handleMove(element.id, x, y)}
          onStartConnection={(point) => handleStartConnection(element.id, point)}
          onConnectionTargetChange={(isTarget) => handleConnectionTarget(isTarget ? element.id : null)}
          onContextMenu={(e) => handleContextMenu(e, element.id)}
        />
      ))}

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={handleDeleteElement}
          onStartConnect={() => handleStartConnection(contextMenu.elementId, 'right')}
          onBringToFront={handleBringToFront}
        />
      )}
    </div>
  );
}
