// src/components/views/MapView.tsx
// Constellation map — organic scatter layout with flowing Bézier connections

import { useMemo, useCallback, useState } from 'react';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import type {
  SceneLocation,
  ReachableLocation,
  SceneMapSnapshot,
} from '../../types/api';

interface ViewNode {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: string;
}

interface KnownLocationInfo {
  key: string;
  name: string;
}

interface MapViewProps {
  currentLocation: SceneLocation;
  reachableLocations: ReachableLocation[];
  mapSnapshot?: SceneMapSnapshot | null;
  knownLocations?: KnownLocationInfo[];
  mapName?: string;
  onMove: (locationKey: string) => void;
  loading?: boolean;
}

/** Deterministic pseudo-random from string — keeps nodes stable across re-renders */
function hashFromString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0) / 4294967296;
}

function getViewBox(nodes: ViewNode[], padding = 100): string {
  if (nodes.length === 0) return '0 0 100 100';
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
}

/** Organic quadratic Bézier path from (x1,y1) to (x2,y2) */
function curvedPath(x1: number, y1: number, x2: number, y2: number, bend = 0.25): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Perpendicular offset for control point
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export function MapView({
  currentLocation,
  reachableLocations,
  mapSnapshot,
  knownLocations,
  mapName,
  onMove,
  loading,
}: MapViewProps) {
  const allNodes = useMemo((): ViewNode[] => {
    if (mapSnapshot?.locations && mapSnapshot.locations.length > 0) {
      const current = mapSnapshot.locations.find(
        (loc) => loc.key === currentLocation.key,
      );
      const offsetX = current ? current.view_x : 0;
      const offsetY = current ? current.view_y : 0;

      return mapSnapshot.locations.map((loc) => ({
        id: loc.key,
        x: loc.view_x - offsetX,
        y: loc.view_y - offsetY,
        label: loc.name,
        icon: loc.view_icon || '',
      }));
    }

    // Use knownLocations from GET /sessions/{id} to render full map when snapshot coordinates are unavailable
    if (knownLocations && knownLocations.length > 0) {
      const nodes: ViewNode[] = [
        {
          id: currentLocation.key,
          x: 0,
          y: 0,
          label: currentLocation.name,
          icon: '',
        },
      ];

      const others = knownLocations.filter((k) => k.key !== currentLocation.key);
      const count = others.length;
      const baseStep = count > 0 ? (2 * Math.PI) / count : 0;

      others.forEach((loc, i) => {
        const h = hashFromString(loc.key);
        const radius = 130 + h * 110;
        const jitter = (h - 0.5) * 1.22;
        const angle = i * baseStep - Math.PI / 2 + jitter;

        nodes.push({
          id: loc.key,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          label: loc.name,
          icon: '',
        });
      });

      return nodes;
    }

    // Fallback: legacy organic ring layout (current + reachable only)
    const nodes: ViewNode[] = [
      {
        id: currentLocation.key,
        x: 0,
        y: 0,
        label: currentLocation.name,
        icon: '',
      },
    ];

    const count = reachableLocations.length;
    const baseStep = count > 0 ? (2 * Math.PI) / count : 0;

    reachableLocations.forEach((r, i) => {
      const h = hashFromString(r.key);
      const radius = 130 + h * 110;
      const jitter = (h - 0.5) * 1.22;
      const angle = i * baseStep - Math.PI / 2 + jitter;

      nodes.push({
        id: r.key,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        label: r.name,
        icon: '',
      });
    });

    return nodes;
  }, [currentLocation, reachableLocations, mapSnapshot, knownLocations]);

  const connections = useMemo(() => {
    if (mapSnapshot?.connections && mapSnapshot.connections.length > 0) {
      const connList: { id: string; d: string; isLocked: boolean }[] = [];
      mapSnapshot.connections.forEach((conn) => {
        const from = allNodes.find((n) => n.id === conn.from_key);
        const to = allNodes.find((n) => n.id === conn.to_key);
        if (from && to) {
          const h = hashFromString(`${conn.from_key}-${conn.to_key}`);
          const bend = (h - 0.5) * 0.25;
          connList.push({
            id: `conn-${conn.from_key}-${conn.to_key}`,
            d: curvedPath(from.x, from.y, to.x, to.y, bend),
            isLocked: conn.is_locked,
          });
        }
      });
      return { spokes: connList, web: [] };
    }

    // Fallback: legacy star + web layout
    const center = allNodes[0];
    const spokes = reachableLocations.map((r) => {
      const target = allNodes.find((n) => n.id === r.key)!;
      const h = hashFromString(`spoke-${r.key}`);
      const bend = (h - 0.5) * 0.35;
      return {
        id: `spoke-${r.key}`,
        d: curvedPath(center.x, center.y, target.x, target.y, bend),
        isLocked: false,
      };
    });

    const web: { id: string; d: string; isLocked: boolean }[] = [];
    // Connect some reachable nodes to each other when they are close enough
    const nonCenter = allNodes.slice(1);
    for (let i = 0; i < nonCenter.length; i++) {
      for (let j = i + 1; j < nonCenter.length; j++) {
        const a = nonCenter[i];
        const b = nonCenter[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const h = hashFromString(`web-${a.id}-${b.id}`);
        if (dist < 260 && h > 0.35) {
          const bend = (h * 2 - 1) * 0.2;
          web.push({
            id: `web-${a.id}-${b.id}`,
            d: curvedPath(a.x, a.y, b.x, b.y, bend),
            isLocked: false,
          });
        }
      }
    }

    return { spokes, web };
  }, [allNodes, reachableLocations, mapSnapshot]);

  const reachableSet = useMemo(
    () => new Set(reachableLocations.map((r) => r.key)),
    [reachableLocations],
  );

  const viewBox = useMemo(() => getViewBox(allNodes), [allNodes]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (!reachableSet.has(nodeId) || loading) return;
      onMove(nodeId);
    },
    [reachableSet, loading, onMove],
  );

  return (
    <div className="relative w-full h-full overflow-hidden bg-(--bg-primary)">
      {loading && <LoadingOverlay />}
      {/* Ambient radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(190, 75, 219, 0.06) 0%, transparent 60%)',
        }}
      />

      {/* Floating header overlay */}
      <div className="absolute top-5 left-5 z-10 pointer-events-none">
        <h2 className="text-[10px] text-(--text-muted) uppercase tracking-[0.3em]">地图</h2>
        <h1 className="font-serif text-2xl text-(--text-primary) mt-1">
          {mapSnapshot?.map_name || mapName || '未知地图'}
        </h1>
      </div>

      <svg
        className="w-full h-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-label="洋馆地图"
      >
        <defs>
          {/* Soft glow for paths */}
          <filter id="path-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.745  0 0 0 0 0.294  0 0 0 0 0.859  0 0 0 1 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Drop shadow for reachable nodes */}
          <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradient for active spokes */}
          <linearGradient id="spoke-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(190, 75, 219, 0.85)" />
            <stop offset="100%" stopColor="rgba(217, 70, 239, 0.25)" />
          </linearGradient>
        </defs>

        {/* Web connections (subtle, background) */}
        <g>
          {connections.web.map((conn) => (
            <path
              key={conn.id}
              d={conn.d}
              fill="none"
              stroke="var(--border-color)"
              strokeOpacity={0.22}
              strokeWidth={1}
            />
          ))}
        </g>

        {/* Active spokes with flowing dash animation */}
        <g>
          {connections.spokes.map((conn, idx) => (
            <g key={conn.id}>
              {/* Outer haze */}
              <path
                d={conn.d}
                fill="none"
                stroke="var(--accent-primary)"
                strokeOpacity={0.15}
                strokeWidth={10}
                filter="url(#path-glow)"
              />
              {/* Mid glow */}
              <path
                d={conn.d}
                fill="none"
                stroke="var(--accent-primary)"
                strokeOpacity={0.35}
                strokeWidth={4}
              />
              {/* Core line */}
              <path
                d={conn.d}
                fill="none"
                stroke="url(#spoke-gradient)"
                strokeOpacity={0.9}
                strokeWidth={1.5}
              />
              {/* Flowing particle */}
              <path
                d={conn.d}
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={2}
                strokeDasharray="6 120"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="126"
                  dur={`${2.5 + (idx % 3) * 0.4}s`}
                  repeatCount="indefinite"
                />
              </path>
            </g>
          ))}
        </g>

        {/* Nodes */}
        <g>
          {allNodes.map((node) => {
            const isCurrent = node.id === currentLocation.key;
            const isReachable = reachableSet.has(node.id) && !isCurrent;
            const isUnreachable = !isCurrent && !isReachable;

            const isHovered = hoveredNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={isReachable ? 'cursor-pointer' : ''}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => isReachable && setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Current node: slow breathing halo */}
                {isCurrent && (
                  <>
                    <circle
                      r="22"
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeOpacity="0.15"
                      strokeWidth="1"
                    >
                      <animate
                        attributeName="r"
                        values="22;36;22"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-opacity"
                        values="0.2;0;0.2"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle r="14" fill="var(--accent-primary)" opacity="0.25">
                      <animate
                        attributeName="r"
                        values="14;22;14"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}

                {/* Reachable node: soft glow */}
                {isReachable && (
                  <circle
                    r={isHovered ? 22 : 18}
                    fill="var(--accent-primary)"
                    opacity={isHovered ? 0.22 : 0.12}
                    filter="url(#node-glow)"
                    className="transition-all duration-300 ease-out"
                  />
                )}

                {/* Node body */}
                <circle
                  r={isCurrent ? 12 : isHovered ? 13 : 10}
                  fill={
                    isCurrent
                      ? 'var(--accent-primary)'
                      : isReachable
                        ? isHovered
                          ? 'var(--bg-tertiary)'
                          : 'var(--bg-secondary)'
                        : '#4b5563'
                  }
                  stroke={
                    isCurrent
                      ? 'var(--text-primary)'
                      : isReachable
                        ? 'var(--accent-primary)'
                        : '#6b7280'
                  }
                  strokeWidth={isCurrent ? 2.5 : isHovered ? 2.5 : 2}
                  className="transition-all duration-300 ease-out"
                />

                {/* Inner dot for reachable nodes */}
                {isReachable && (
                  <circle
                    r={isHovered ? 4 : 3}
                    fill="var(--accent-primary)"
                    opacity="0.9"
                    className="transition-all duration-300 ease-out"
                  />
                )}

                {/* Icon inside node */}
                <text
                  dy="1"
                  textAnchor="middle"
                  className="text-[10px] pointer-events-none select-none"
                  style={{
                    fill: isCurrent ? '#ffffff' : isUnreachable ? '#9ca3af' : 'var(--text-secondary)',
                  }}
                >
                  {node.icon}
                </text>

                {/* Label below node */}
                <text
                  y={isCurrent ? '26' : isHovered ? '28' : '24'}
                  textAnchor="middle"
                  className="text-[10px] font-serif pointer-events-none select-none transition-all duration-300 ease-out"
                  style={{
                    fill: isUnreachable ? '#9ca3af' : 'var(--text-primary)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 2px var(--bg-primary)',
                  }}
                >
                  {node.label}
                </text>

                {/* Larger invisible hit area for reachable nodes */}
                {isReachable && <circle r="28" fill="transparent" />}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
