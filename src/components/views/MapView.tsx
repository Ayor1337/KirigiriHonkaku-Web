// src/components/views/MapView.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { mansionMap } from '../../data/mapMock';
import type { GameMap, MapNode, MapConnection, MapViewState } from '../../types/map';

interface MapViewProps {
  map?: GameMap;
  onSelectLocation?: (node: MapNode) => void;
}

export function MapView({ map = mansionMap, onSelectLocation }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState<MapViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
  });

  // 节点位置状态
  const [nodes] = useState<MapNode[]>(map.nodes);

  const dragStart = useRef({ x: 0, y: 0 });
  const lastOffset = useRef({ x: 0, y: 0 });

  // 初始化居中
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      setViewState(prev => ({
        ...prev,
        offsetX: centerX - map.centerX,
        offsetY: centerY - map.centerY,
      }));
    }
  }, [map.centerX, map.centerY]);

  // 处理画布拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.map-node')) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastOffset.current = { x: viewState.offsetX, y: viewState.offsetY };
    setViewState(prev => ({ ...prev, isDragging: true }));
  }, [viewState.offsetX, viewState.offsetY]);

  // 处理移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (viewState.isDragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setViewState(prev => ({
        ...prev,
        offsetX: lastOffset.current.x + dx,
        offsetY: lastOffset.current.y + dy,
      }));
    }
  }, [viewState.isDragging]);

  // 处理释放
  const handleMouseUp = useCallback(() => {
    setViewState(prev => ({ ...prev, isDragging: false }));
  }, []);

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(2, viewState.scale * delta));
    setViewState(prev => ({ ...prev, scale: newScale }));
  }, [viewState.scale]);

  // 获取节点样式
  const getNodeStyle = (node: MapNode) => {
    const isSelected = viewState.selectedNodeId === node.id;
    const isCurrent = node.status === 'current';
    const isUnexplored = node.status === 'unexplored';

    let baseClasses = 'absolute map-node group cursor-pointer transition-all duration-300 ';

    if (isUnexplored) {
      baseClasses += 'opacity-40 grayscale';
    } else if (isCurrent) {
      baseClasses += 'scale-110 z-20';
    } else if (isSelected) {
      baseClasses += 'scale-105 z-10';
    }

    return baseClasses;
  };

  // SVG画布偏移量（与样式中的left/top对应）
  const SVG_OFFSET = 1000;

  // 计算连线路径 - 坐标需要加上SVG偏移量
  const getConnectionPath = (conn: MapConnection): string => {
    const from = nodes.find(n => n.id === conn.fromId);
    const to = nodes.find(n => n.id === conn.toId);
    if (!from || !to) return '';

    // 加上SVG画布偏移量
    const fromX = from.x + SVG_OFFSET;
    const fromY = from.y + SVG_OFFSET;
    const toX = to.x + SVG_OFFSET;
    const toY = to.y + SVG_OFFSET;

    // 计算角度和距离
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 根据连接类型绘制不同路径
    if (conn.type === 'secret') {
      // 虚线秘密通道
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    if (conn.type === 'locked') {
      // 带锁符号的路径
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    // 普通路径 - 轻微曲线
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const curveOffset = distance * 0.1;
    const perpX = -Math.sin(angle) * curveOffset;
    const perpY = Math.cos(angle) * curveOffset;

    return `M ${fromX} ${fromY} Q ${midX + perpX} ${midY + perpY} ${toX} ${toY}`;
  };

  // 是否显示连线（至少一端已探索）
  const isConnectionVisible = (conn: MapConnection): boolean => {
    const from = nodes.find(n => n.id === conn.fromId);
    const to = nodes.find(n => n.id === conn.toId);
    return (from?.status !== 'unexplored' || to?.status !== 'unexplored');
  };

  // 获取区域颜色
  const getRegionColor = (region?: string): string => {
    const colors: Record<string, string> = {
      'main': '#be4bdb',
      'east': '#3b82f6',
      'west': '#10b981',
      'garden': '#f59e0b',
      'basement': '#ef4444',
      'secret': '#8b5cf6',
    };
    return colors[region || 'main'] || '#be4bdb';
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-(--bg-primary) cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* 背景纹理层 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(190, 75, 219, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* 网格背景 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(190, 75, 219, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* 地图变换容器 */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: 0,
          height: 0,
          transform: `translate(${viewState.offsetX}px, ${viewState.offsetY}px) scale(${viewState.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG 连线层 - 使用足够大的画布覆盖所有节点 */}
        <svg
          className="absolute pointer-events-none overflow-visible"
          style={{
            left: -1000,
            top: -1000,
            width: 3000,
            height: 3000,
          }}
        >
          <defs>
            {/* 发光滤镜 */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* 箭头标记 */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="20"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(190, 75, 219, 0.6)" />
            </marker>
          </defs>

          {map.connections.filter(isConnectionVisible).map((conn) => {
            const from = nodes.find(n => n.id === conn.fromId);
            const to = nodes.find(n => n.id === conn.toId);
            if (!from || !to) return null;

            const isFullyExplored = from.status !== 'unexplored' && to.status !== 'unexplored';
            const color = getRegionColor(from.region);

            return (
              <g key={conn.id}>
                {/* 发光背景线 */}
                <path
                  d={getConnectionPath(conn)}
                  stroke={color}
                  strokeWidth={conn.type === 'main' ? 3 : 2}
                  opacity={isFullyExplored ? 0.2 : 0.1}
                  fill="none"
                  filter="url(#glow)"
                />
                {/* 主线条 */}
                <path
                  d={getConnectionPath(conn)}
                  stroke={color}
                  strokeWidth={conn.type === 'main' ? 2 : 1}
                  opacity={isFullyExplored ? 0.6 : 0.3}
                  fill="none"
                  strokeDasharray={conn.type === 'secret' ? '5,5' : conn.type === 'locked' ? '3,3' : undefined}
                />
                {/* 流动动画效果 - 已探索的路径 */}
                {isFullyExplored && conn.type === 'main' && (
                  <path
                    d={getConnectionPath(conn)}
                    stroke={color}
                    strokeWidth={2}
                    fill="none"
                    strokeDasharray="10, 100"
                    opacity={0.8}
                    filter="url(#glow)"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="110"
                      to="0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </path>
                )}
              </g>
            );
          })}
        </svg>

        {/* 节点层 */}
        {nodes.map((node) => {
          const regionColor = getRegionColor(node.region);
          const isCurrent = node.status === 'current';
          const isUnexplored = node.status === 'unexplored';

          return (
            <div
              key={node.id}
              className={getNodeStyle(node)}
              style={{
                left: node.x - 40,
                top: node.y - 40,
                width: 80,
                height: 80,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isUnexplored) {
                  setViewState(prev => ({ ...prev, selectedNodeId: node.id }));
                  onSelectLocation?.(node);
                }
              }}
              onMouseEnter={() => setViewState(prev => ({ ...prev, hoveredNodeId: node.id }))}
              onMouseLeave={() => setViewState(prev => ({ ...prev, hoveredNodeId: undefined }))}
            >
              {/* 节点光晕 */}
              {!isUnexplored && (
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-30"
                  style={{ backgroundColor: regionColor }}
                />
              )}

              {/* 节点主体 */}
              <div
                className={`
                  relative w-full h-full rounded-full flex flex-col items-center justify-center
                  border-2 transition-all duration-300
                  ${isCurrent ? 'animate-pulse' : ''}
                `}
                style={{
                  backgroundColor: isUnexplored ? 'var(--bg-secondary)' : `${regionColor}20`,
                  borderColor: isCurrent ? regionColor : isUnexplored ? 'var(--border-color)' : `${regionColor}60`,
                  boxShadow: isCurrent ? `0 0 30px ${regionColor}80` : `0 0 15px ${regionColor}30`,
                }}
              >
                {/* 图标 */}
                <span className="text-2xl mb-0.5 select-none">
                  {isUnexplored ? '❓' : node.icon}
                </span>

                {/* 名称 */}
                <span className="text-[9px] text-center px-2 leading-tight select-none"
                  style={{ color: isUnexplored ? 'var(--text-muted)' : 'var(--text-primary)' }}
                >
                  {node.label}
                </span>

                {/* 标记徽章 */}
                <div className="absolute -top-1 -right-1 flex flex-col gap-0.5">
                  {node.clueCount > 0 && !isUnexplored && (
                    <span className="w-5 h-5 bg-[#f59e0b] rounded-full flex items-center justify-center text-xs shadow-lg">
                      🔍
                    </span>
                  )}
                  {node.npcCount > 0 && !isUnexplored && (
                    <span className="w-5 h-5 bg-[#3b82f6] rounded-full flex items-center justify-center text-xs shadow-lg">
                      👤
                    </span>
                  )}
                </div>

                {/* 锁定标记 */}
                {node.isLocked && !isUnexplored && (
                  <span className="absolute -bottom-1 bg-(--bg-secondary) border border-(--danger) rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    🔒
                  </span>
                )}
              </div>

              {/* 迷雾覆盖 */}
              {isUnexplored && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, transparent 30%, rgba(10, 6, 9, 0.8) 70%)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* UI 控制层 */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto">
        {/* 地图标题 */}
        <div className="bg-(--bg-secondary)/90 backdrop-blur-md border border-(--border-color) rounded-xl p-4 max-w-[240px]">
          <h3 className="text-(--text-primary) font-serif text-xl">{map.name}</h3>
          <p className="text-(--text-secondary) text-xs mt-1 leading-relaxed">{map.description}</p>
        </div>

        {/* 缩放控制 */}
        <div className="flex items-center gap-2 bg-(--bg-secondary)/80 backdrop-blur-sm border border-(--border-color) rounded-lg p-1">
          <button
            onClick={() => setViewState(prev => ({ ...prev, scale: Math.max(0.3, prev.scale - 0.1) }))}
            className="w-8 h-8 flex items-center justify-center text-(--text-primary) hover:text-(--accent-primary) transition-colors rounded"
          >
            −
          </button>
          <span className="text-(--text-secondary) text-xs w-12 text-center">{Math.round(viewState.scale * 100)}%</span>
          <button
            onClick={() => setViewState(prev => ({ ...prev, scale: Math.min(2, prev.scale + 0.1) }))}
            className="w-8 h-8 flex items-center justify-center text-(--text-primary) hover:text-(--accent-primary) transition-colors rounded"
          >
            +
          </button>
        </div>

        {/* 重置视角 */}
        <button
          onClick={() => {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setViewState(prev => ({
                ...prev,
                offsetX: rect.width / 2 - map.centerX,
                offsetY: rect.height / 2 - map.centerY,
                scale: 1,
              }));
            }
          }}
          className="bg-(--bg-secondary)/80 backdrop-blur-sm border border-(--border-color) text-(--text-secondary) text-xs px-3 py-2 rounded-lg hover:border-(--accent-primary) hover:text-(--text-primary) transition-colors"
        >
          重置视角
        </button>
      </div>

      {/* 图例 */}
      <div className="absolute bottom-4 right-4 bg-(--bg-secondary)/90 backdrop-blur-md border border-(--border-color) rounded-xl p-4 pointer-events-auto">
        <h4 className="text-(--text-primary) text-xs font-semibold mb-3">图例</h4>
        <div className="space-y-2 text-[10px] text-(--text-secondary)">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#be4bdb]/30 border border-[#be4bdb]"></span>
            <span>主馆区域</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981]/30 border border-[#10b981]"></span>
            <span>西侧厢房</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]/30 border border-[#f59e0b]"></span>
            <span>花园</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]/30 border border-[#ef4444]"></span>
            <span>地下室</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-0.5 bg-[#be4bdb]/60"></span>
            <span>已探索路径</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-0.5 border-t border-dashed border-[#be4bdb]/40"></span>
            <span>秘密通道</span>
          </div>
        </div>
      </div>

      {/* 悬停信息卡片 */}
      {viewState.hoveredNodeId && (() => {
        const node = nodes.find(n => n.id === viewState.hoveredNodeId);
        if (!node || node.status === 'unexplored') return null;

        return (
          <div className="absolute bottom-4 left-4 bg-(--bg-secondary)/95 backdrop-blur-md border border-(--accent-primary)/50 rounded-xl p-4 pointer-events-none max-w-[280px]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{node.icon}</span>
              <div>
                <h4 className="text-(--text-primary) font-medium">{node.label}</h4>
                <span className="text-[10px] text-(--text-secondary)">
                  {node.region === 'main' ? '主馆' : node.region === 'east' ? '东翼' : node.region === 'west' ? '西翼' : node.region === 'garden' ? '花园' : '地下室'}
                </span>
              </div>
            </div>
            {node.description && (
              <p className="text-xs text-(--text-secondary) leading-relaxed mb-2">{node.description}</p>
            )}
            <div className="flex gap-3 text-[10px] text-(--text-muted)">
              {node.clueCount > 0 && <span>🔍 {node.clueCount} 条线索</span>}
              {node.npcCount > 0 && <span>👤 {node.npcCount} 位人物</span>}
              {node.isLocked && <span className="text-[#ef4444]">🔒 已上锁</span>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
