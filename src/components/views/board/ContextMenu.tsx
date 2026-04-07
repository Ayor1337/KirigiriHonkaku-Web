// src/components/views/board/ContextMenu.tsx
interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onBringToFront: () => void;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onDelete,
  onBringToFront,
}: ContextMenuProps) {
  return (
    <>
      {/* 背景遮罩，点击关闭菜单 */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* 菜单 */}
      <div
        className="context-menu"
        style={{ left: x, top: y }}
      >
        <div className="context-menu-item" onClick={() => { onBringToFront(); }}>
          <span>置于顶层</span>
        </div>
        <div className="context-menu-divider" />
        <div className="context-menu-item danger" onClick={() => { onDelete(); }}>
          <span>删除</span>
        </div>
      </div>
    </>
  );
}
