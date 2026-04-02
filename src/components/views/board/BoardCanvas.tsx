// src/components/views/board/BoardCanvas.tsx
import { useState, useCallback, useRef } from 'react';
import { BoardCard } from './BoardCard';
import { BoardConnections } from './BoardConnections';
import { ContextMenu } from './ContextMenu';
import type { BoardElement, BoardConnection } from '../../../types/board';

interface BoardCanvasProps {
  elements: BoardElement[];
  connections: BoardConnection[];
  onElementsChange: (elements: BoardElement[]) => void;
  onConnectionsChange: (connections: BoardConnection[]) => void;
}

// 交互状态机
type InteractionMode =
  | { type: 'idle' }
  | { type: 'dragging'; elementId: string; offsetX: number; offsetY: number }
  | { type: 'connecting'; fromId: string; startX: number; startY: number };

// 获取元素尺寸 - 纯函数，不依赖组件状态
function getElementSize(element: BoardElement) {
  const width = element.type === 'note' ? 150 : element.type === 'npc' ? 160 : 180;
  const height = element.type === 'location' ? 140 : 100;
  return { width, height };
}

export function BoardCanvas({
  elements,
  connections,
  onElementsChange,
  onConnectionsChange,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<InteractionMode>({ type: 'idle' });
  const [previewLine, setPreviewLine] = useState<{ fromX: number; fromY: number; toX: number; toY: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);

  // 指针按下事件 - 统一入口
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const cardElement = target.closest<HTMLElement>('[data-board-id]');

    // 点击连接点 - 开始连接
    const connectionPoint = target.closest<HTMLElement>('[data-connection-point]');
    if (connectionPoint && cardElement) {
      e.preventDefault();
      e.stopPropagation();

      const fromId = cardElement.dataset.boardId!;
      const element = elements.find(el => el.id === fromId);
      if (!element) return;

      const { width, height } = getElementSize(element);
      const startX = element.x + width / 2;
      const startY = element.y + height / 2;

      setMode({ type: 'connecting', fromId, startX, startY });
      setPreviewLine({ fromX: startX, fromY: startY, toX: startX, toY: startY });
      return;
    }

    // 点击卡片 - 开始拖拽或选择
    if (cardElement) {
      e.preventDefault();
      e.stopPropagation();

      const elementId = cardElement.dataset.boardId!;
      const element = elements.find(el => el.id === elementId);
      if (!element) return;

      // 计算偏移量（相对于卡片左上角）
      const rect = cardElement.getBoundingClientRect();
      const parentRect = canvasRef.current?.getBoundingClientRect();
      if (!parentRect) return;

      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      setSelectedId(elementId);
      setContextMenu(null);
      setMode({ type: 'dragging', elementId, offsetX, offsetY });
      return;
    }

    // 点击空白处 - 取消选择
    setSelectedId(null);
    setContextMenu(null);
  }, [elements]);

  // 指针移动事件
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 拖拽模式 - 更新元素位置
    if (mode.type === 'dragging') {
      const newX = Math.max(0, mouseX - mode.offsetX);
      const newY = Math.max(0, mouseY - mode.offsetY);

      onElementsChange(
        elements.map(el =>
          el.id === mode.elementId ? { ...el, x: newX, y: newY } : el
        )
      );
      return;
    }

    // 连接模式 - 更新预览线
    if (mode.type === 'connecting') {
      setPreviewLine({
        fromX: mode.startX,
        fromY: mode.startY,
        toX: mouseX,
        toY: mouseY,
      });
    }
  }, [mode, elements, onElementsChange]);

  // 指针松开事件
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    // 拖拽结束
    if (mode.type === 'dragging') {
      setMode({ type: 'idle' });
      return;
    }

    // 连接结束 - 检查是否落在目标卡片上
    if (mode.type === 'connecting') {
      const target = e.target as HTMLElement;
      const cardElement = target.closest<HTMLElement>('[data-board-id]');
      const targetId = cardElement?.dataset.boardId;

      if (targetId && targetId !== mode.fromId) {
        // 创建连接
        const newConnection: BoardConnection = {
          id: `conn-${Date.now()}`,
          fromId: mode.fromId,
          toId: targetId,
          color: 'var(--accent-primary)',
          createdAt: new Date(),
        };
        onConnectionsChange([...connections, newConnection]);
      }

      setMode({ type: 'idle' });
      setPreviewLine(null);
    }
  }, [mode, connections, onConnectionsChange]);

  // 右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const target = e.target as HTMLElement;
    const cardElement = target.closest<HTMLElement>('[data-board-id]');

    if (cardElement) {
      const elementId = cardElement.dataset.boardId!;
      setSelectedId(elementId);
      setContextMenu({ x: e.clientX, y: e.clientY, elementId });
    } else {
      setContextMenu(null);
    }
  }, []);

  // 删除元素
  const handleDeleteElement = useCallback(() => {
    if (!contextMenu) return;

    onElementsChange(elements.filter(e => e.id !== contextMenu.elementId));
    onConnectionsChange(
      connections.filter(
        c => c.fromId !== contextMenu.elementId && c.toId !== contextMenu.elementId
      )
    );
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

  // 删除连接
  const handleDeleteConnection = useCallback((id: string) => {
    onConnectionsChange(connections.filter(c => c.id !== id));
  }, [connections, onConnectionsChange]);

  return (
    <div
      ref={canvasRef}
      className={`board-canvas ${mode.type === 'connecting' ? 'connecting' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      {/* 网格背景 */}
      <div className="board-grid" />

      {/* 连接线层 */}
      <BoardConnections
        connections={connections}
        elements={elements}
        previewLine={previewLine}
        onDeleteConnection={handleDeleteConnection}
      />

      {/* 元素卡片层 */}
      {elements.map((element, index) => (
        <BoardCard
          key={element.id}
          element={{ ...element, rotation: element.rotation || (index % 3 - 1) * 2 }}
          isSelected={selectedId === element.id}
          isConnecting={mode.type === 'connecting' && mode.fromId === element.id}
          isConnectionTarget={false}
        />
      ))}

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={handleDeleteElement}
          onBringToFront={handleBringToFront}
        />
      )}
    </div>
  );
}
