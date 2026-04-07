// src/components/views/DetectiveBoardView.tsx
import { useState, useCallback } from "react";
import { InkButton } from "../ui/InkButton";
import { BoardCanvas } from "./board/BoardCanvas";
import { BoardToolbar } from "./board/BoardToolbar";
import type { SceneLocation, VisibleNpc } from "../../types/api";
import type { DiscoveredClue } from "../../hooks/useGameSession";
import type { BoardElement, BoardConnection } from "../../types/board";
import "../../styles/board.css";

interface DetectiveBoardViewProps {
  discoveredClues: DiscoveredClue[];
  currentLocation: SceneLocation;
  visibleNpcs: VisibleNpc[];
  onBack: () => void;
}

export function DetectiveBoardView({
  discoveredClues,
  currentLocation,
  visibleNpcs,
  onBack,
}: DetectiveBoardViewProps) {
  const [connections, setConnections] = useState<BoardConnection[]>([]);

  const [elements, setElements] = useState<BoardElement[]>(() => {
    const newElements: BoardElement[] = [];

    // 添加已发现的线索
    discoveredClues.forEach((clue, index) => {
      const offsetX = (index * 17) % 50;
      const offsetY = (index * 31) % 50;
      const rotation = ((index * 7) % 8) - 4;

      newElements.push({
        id: `clue-${clue.key}`,
        type: "clue",
        x: 100 + (index % 3) * 250 + offsetX,
        y: 100 + Math.floor(index / 3) * 150 + offsetY,
        title: clue.name,
        content: clue.clue_type,
        sourceId: clue.key,
        createdAt: new Date(),
        rotation,
      });
    });

    // 添加当前地点
    newElements.push({
      id: "location-current",
      type: "location",
      x: 600,
      y: 100,
      title: currentLocation.name,
      content: (currentLocation.description ?? "").slice(0, 60) + "...",
      createdAt: new Date(),
      rotation: -1,
    });

    // 添加可见人物
    visibleNpcs.forEach((npc, index) => {
      const rotation = ((index * 13) % 6) - 3;
      newElements.push({
        id: `npc-${npc.key}`,
        type: "npc",
        x: 150 + index * 200,
        y: 400,
        title: npc.display_name,
        content: "",
        sourceId: npc.key,
        createdAt: new Date(),
        rotation,
      });
    });

    return newElements;
  });

  // 添加便利贴
  const handleAddNote = useCallback(() => {
    const timestamp = Date.now();
    // 使用 timestamp 生成伪随机偏移
    const offsetX = timestamp % 200;
    const offsetY = (timestamp >> 3) % 150;
    const rotation = (timestamp % 12) - 6; // -6 到 6 度

    const newNote: BoardElement = {
      id: `note-${timestamp}`,
      type: "note",
      x: 300 + offsetX,
      y: 200 + offsetY,
      title: "",
      content: "",
      createdAt: new Date(),
      rotation,
    };
    setElements((prev) => [...prev, newNote]);
  }, []);

  // 清空画布
  const handleClearBoard = useCallback(() => {
    // 保留初始化的线索、地点、人物、时间，只删除玩家添加的便利贴和连接
    setElements((prev) => prev.filter((el) => el.type !== "note"));
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
          拖拽移动 · 右键菜单 · 拖拽连接点建立关联
        </div>
      </div>
    </div>
  );
}
