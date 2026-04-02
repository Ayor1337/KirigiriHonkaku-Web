// src/components/ui/RiskIndicator.tsx
interface RiskIndicatorProps {
  level: number; // 0-100
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
  const getCrackOpacity = () => {
    if (level < 25) return 0.2;
    if (level < 50) return 0.5;
    if (level < 75) return 0.8;
    return 1;
  };

  const getColor = () => {
    if (level < 25) return '#9CA3AF';
    if (level < 50) return '#F59E0B';
    if (level < 75) return '#DC2626';
    return '#991B1B';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        {/* 基础圆形 */}
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* 外圈 */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="2"
          />

          {/* 裂纹 - 根据风险值显示 */}
          <g
            opacity={getCrackOpacity()}
            stroke={getColor()}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          >
            {/* 裂纹1 - 从左上 */}
            <path
              d="M8 12 L15 18 L12 25"
              strokeDasharray="30"
              strokeDashoffset={level > 10 ? 0 : 30}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            {/* 裂纹2 - 从右上 */}
            <path
              d="M40 10 L35 16 L38 22"
              strokeDasharray="25"
              strokeDashoffset={level > 30 ? 0 : 25}
              style={{ transition: 'stroke-dashoffset 0.5s ease 0.1s' }}
            />
            {/* 裂纹3 - 从下方 */}
            <path
              d="M24 44 L22 35 L28 30"
              strokeDasharray="20"
              strokeDashoffset={level > 50 ? 0 : 20}
              style={{ transition: 'stroke-dashoffset 0.5s ease 0.2s' }}
            />
            {/* 裂纹4 - 危险时 */}
            {level >= 75 && (
              <path
                d="M15 35 L20 28 L18 22 L24 24"
                strokeWidth="2"
                style={{ animation: 'crack-appear 0.3s ease forwards' }}
              />
            )}
          </g>

          {/* 中心核心 */}
          <circle
            cx="24"
            cy="24"
            r={6 + (level / 100) * 4}
            fill={getColor()}
            opacity={0.3 + (level / 100) * 0.5}
            style={{ transition: 'all 0.3s ease' }}
          />
        </svg>
      </div>

      {/* 数值显示 */}
      <div className="flex flex-col">
        <span className="text-xs text-(--text-muted) uppercase tracking-wider">
          暴露度
        </span>
        <span
          className="font-mono text-lg font-bold"
          style={{ color: getColor() }}
        >
          {level}%
        </span>
      </div>
    </div>
  );
}
