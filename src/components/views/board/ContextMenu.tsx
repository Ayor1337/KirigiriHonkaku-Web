// src/components/views/board/ContextMenu.tsx
interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onStartConnect: () => void;
  onBringToFront: () => void;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onDelete,
  onStartConnect,
  onBringToFront,
}: ContextMenuProps) {
  return (
    <>
      {/* 点击外部关闭菜单的背景层 */}
      <div
        className="fixed inset-0 z-[999]"
        onClick={onClose}
      />
      <div
        className="context-menu"
        style={{ left: x, top: y }}
      >
        <div className="context-menu-item" onClick={() => { onStartConnect(); onClose(); }}>
          <span>🔗</span>
          <span>开始连接</span>
        </div>
        <div className="context-menu-item" onClick={() => { onBringToFront(); onClose(); }}>
          <span>⬆️</span>
          <span>置于顶层</span>
        </div>
        <div className="context-menu-divider" />
        <div className="context-menu-item danger" onClick={() => { onDelete(); onClose(); }}>
          <span>🗑️</span>
          <span>删除</span>
        </div>
      </div>
    </>
  );
}
