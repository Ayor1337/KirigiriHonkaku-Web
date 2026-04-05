// src/components/views/PlayerProfileView.tsx
// 玩家个人资料页面 - 维多利亚档案柜风格

import type { GameState } from '../../types/game';

interface PlayerProfileViewProps {
  gameState: GameState;
  onBack: () => void;
}

export function PlayerProfileView({ gameState, onBack }: PlayerProfileViewProps) {
  // 计算统计数据
  const discoveredCluesCount = gameState.discoveredClues.length;
  const totalLocations = gameState.availableLocations.length;
  const exploredLocations = 5; // 模拟已探索数量
  const talkedNPCs = 2; // 模拟已对话NPC数

  // 获取暴露度等级和颜色
  const getExposureInfo = (level: number) => {
    if (level <= 20) return { label: '安全', color: '#10b981', desc: '你的行踪未被注意' };
    if (level <= 40) return { label: '警惕', color: '#f59e0b', desc: '有人开始注意你的举动' };
    if (level <= 60) return { label: '危险', color: '#ef4444', desc: '你已引起怀疑' };
    return { label: '暴露', color: '#dc2626', desc: '你的身份面临暴露风险' };
  };

  const exposureInfo = getExposureInfo(gameState.exposureLevel);

  return (
    <div className="h-full overflow-y-auto bg-(--bg-primary) p-8">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-(--text-secondary) hover:text-(--accent-primary) transition-colors group"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="font-serif text-sm tracking-wide">返回调查</span>
      </button>

      {/* 主档案卡 */}
      <div className="max-w-4xl mx-auto">
        {/* 档案头部 - 皮革质感 */}
        <div
          className="relative rounded-t-xl p-8 border-2"
          style={{
            background: 'linear-gradient(135deg, rgba(190, 75, 219, 0.15) 0%, rgba(20, 13, 18, 0.3) 100%)',
            borderColor: 'var(--accent-primary)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* 装饰性边角 */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-(--accent-primary)" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-(--accent-primary)" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-(--accent-primary)" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-(--accent-primary)" />

          <div className="flex items-start gap-8">
            {/* 头像区域 */}
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border-4"
                style={{
                  background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
                  borderColor: 'var(--accent-primary)',
                  boxShadow: '0 0 30px rgba(190, 75, 219, 0.3)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-16 h-16"
                  fill="currentColor"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              {/* 身份徽章 */}
              <div
                className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'var(--bg-primary)',
                  border: '1px solid var(--accent-hover)',
                }}
              >
                侦探
              </div>
            </div>

            {/* 基本信息 */}
            <div className="flex-1">
              <h1
                className="text-4xl font-serif mb-2"
                style={{
                  color: 'var(--text-primary)',
                  textShadow: '0 2px 10px rgba(190, 75, 219, 0.3)',
                }}
              >
                雾切响子
              </h1>
              <p className="text-(--accent-primary) font-serif text-lg mb-4 tracking-wide">
                超高校级的侦探
              </p>

              {/* 特性标签 */}
              <div className="flex flex-wrap gap-2">
                {['敏锐观察', '逻辑推理', '冷静沉着'].map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1 text-xs rounded border"
                    style={{
                      background: 'rgba(190, 75, 219, 0.1)',
                      borderColor: 'rgba(190, 75, 219, 0.3)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 档案主体 */}
        <div
          className="rounded-b-xl p-8 border-x-2 border-b-2 bg-(--bg-secondary) border-(--border-color)"
        >
          {/* 暴露度指示器 - 从顶部栏移过来的 */}
          <div className="mb-8 p-6 rounded-lg border bg-(--bg-tertiary)/80 border-(--border-color)">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-(--text-primary)">暴露度</h3>
              <span
                className="text-2xl font-bold"
                style={{ color: exposureInfo.color }}
              >
                {gameState.exposureLevel}%
              </span>
            </div>

            {/* 进度条 */}
            <div className="h-3 rounded-full overflow-hidden mb-3 bg-(--bg-secondary)">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${gameState.exposureLevel}%`,
                  background: `linear-gradient(90deg, ${exposureInfo.color}80, ${exposureInfo.color})`,
                  boxShadow: `0 0 10px ${exposureInfo.color}40`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span style={{ color: exposureInfo.color }} className="font-medium">
                {exposureInfo.label}
              </span>
              <span className="text-(--text-muted)">{exposureInfo.desc}</span>
            </div>
          </div>

          {/* 属性统计网格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: '持有线索', value: discoveredCluesCount, icon: '🔍', color: '#be4bdb' },
              { label: '探索地点', value: `${exploredLocations}/${totalLocations}`, icon: '📍', color: '#3b82f6' },
              { label: '已对话', value: `${talkedNPCs}人`, icon: '👤', color: '#10b981' },
              { label: '游戏时间', value: '19:00', icon: '⏰', color: '#f59e0b' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-lg border text-center bg-(--bg-tertiary)/60 border-(--border-color)"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-(--text-muted)">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 背景故事 */}
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg text-(--text-primary) mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-(--accent-primary)" />
                人物背景
              </h3>
              <p className="text-(--text-secondary) leading-relaxed text-sm pl-10">
                曾在苏格兰场工作的传奇侦探，以敏锐的观察力和超凡的逻辑推理能力闻名。
                被称为"希望的侦探"，解决过多起悬案。本次受邀调查雾切洋馆的神秘事件。
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg text-(--text-primary) mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-(--accent-primary)" />
                特殊能力
              </h3>
              <div className="pl-10 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-(--accent-primary) text-lg">◆</span>
                  <div>
                    <div className="text-(--text-primary) font-medium text-sm">超高校级观察力</div>
                    <div className="text-(--text-muted) text-xs">能够发现常人忽略的细微线索</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-(--accent-primary) text-lg">◆</span>
                  <div>
                    <div className="text-(--text-primary) font-medium text-sm">逻辑推理</div>
                    <div className="text-(--text-muted) text-xs">快速串联线索，还原事件真相</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 装饰性墨渍 */}
          <div
            className="absolute bottom-4 right-4 w-24 h-24 opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, var(--accent-primary) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
