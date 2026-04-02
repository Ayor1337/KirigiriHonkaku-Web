// src/components/views/board/BoardToolbar.tsx
interface BoardToolbarProps {
  onAddNote: () => void;
  onClearBoard: () => void;
}

export function BoardToolbar({ onAddNote, onClearBoard }: BoardToolbarProps) {
  return (
    <div className="board-toolbar">
      <button
        className="toolbar-btn"
        title="添加便利贴"
        onClick={onAddNote}
      >
        📝
      </button>
      <button
        className="toolbar-btn"
        title="清空画布"
        onClick={() => {
          if (confirm('确定要清空侦探板吗？所有手动添加的便利贴和连接将被删除。')) {
            onClearBoard();
          }
        }}
      >
        🗑️
      </button>
    </div>
  );
}
