// src/components/views/MapView.tsx
// War Fog Map — only shows current location + reachable locations
import { InkButton } from '../ui/InkButton';
import type { SceneLocation, ReachableLocation } from '../../types/api';

interface MapViewProps {
  currentLocation: SceneLocation;
  reachableLocations: ReachableLocation[];
  onMove: (locationKey: string) => void;
  loading?: boolean;
}

export function MapView({
  currentLocation,
  reachableLocations,
  onMove,
  loading,
}: MapViewProps) {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* 标题 */}
      <header>
        <h2 className="text-sm text-(--text-muted) uppercase tracking-wider mb-2">
          地图
        </h2>
        <h1 className="font-heading text-2xl text-(--text-primary)">
          探索区域
        </h1>
        <p className="text-sm text-(--text-secondary) mt-1">
          迷雾中只能看到当前位置与可前往的区域
        </p>
      </header>

      {/* 当前位置 — 中心节点 */}
      <section className="flex flex-col items-center">
        <div className="relative">
          {/* 当前位置卡 */}
          <div className="w-64 p-6 bg-(--accent-primary)/15 border-2 border-(--accent-primary) rounded-xl text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-(--accent-primary)/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-(--accent-primary)" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h3 className="font-heading text-lg text-(--text-primary) mb-1">
              {currentLocation.name}
            </h3>
            <p className="text-xs text-(--text-secondary) line-clamp-2">
              {currentLocation.description ?? '当前所在位置'}
            </p>
            <div className="mt-2 text-xs text-(--accent-primary) font-medium">
              📍 当前位置
            </div>
          </div>

          {/* 连接线装饰 */}
          {reachableLocations.length > 0 && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-px h-8 bg-(--border-color)" />
          )}
        </div>
      </section>

      {/* 可前往地点 */}
      {reachableLocations.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-4 text-center">
            可前往的区域
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {reachableLocations.map((location) => (
              <button
                key={location.key}
                onClick={() => onMove(location.key)}
                disabled={loading}
                className="group p-5 bg-(--bg-secondary) border border-(--border-color) rounded-xl hover:border-(--accent-primary) hover:shadow-lg hover:shadow-(--accent-primary)/10 transition-all duration-300 text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-(--bg-tertiary) border border-(--border-color) flex items-center justify-center group-hover:border-(--accent-primary) transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-(--text-muted) group-hover:text-(--accent-primary) transition-colors" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h4 className="font-heading text-base text-(--text-primary) group-hover:text-(--accent-primary) transition-colors">
                    {location.name}
                  </h4>
                </div>
                <p className="text-xs text-(--text-muted) ml-11">
                  点击前往
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 战争迷雾提示 */}
      <section className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-(--bg-secondary)/60 border border-(--border-color) rounded-full">
          <span className="text-sm text-(--text-muted)">
            🌫️ 更多区域隐藏在迷雾中，继续探索以揭开全貌
          </span>
        </div>
      </section>
    </div>
  );
}
