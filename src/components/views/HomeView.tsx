import { useState, useEffect } from 'react';

interface HomeViewProps {
  onEnter: () => void;
}

export function HomeView({ onEnter }: HomeViewProps) {
  const [mounted, setMounted] = useState(false);
  const [titleRevealed, setTitleRevealed] = useState(0);
  const [subtitleRevealed, setSubtitleRevealed] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  const title = "霧切本格";
  const subtitle = "KIRIGIRI HONKAKU";

  useEffect(() => {
    setMounted(true);

    // 逐字显现标题
    const titleInterval = setInterval(() => {
      setTitleRevealed(prev => {
        if (prev >= title.length) {
          clearInterval(titleInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 180);

    // 副标题延迟显现
    const subtitleTimer = setTimeout(() => {
      setSubtitleRevealed(true);
    }, title.length * 180 + 400);

    // 按钮延迟显现
    const buttonTimer = setTimeout(() => {
      setButtonVisible(true);
    }, title.length * 180 + 800);

    return () => {
      clearInterval(titleInterval);
      clearTimeout(subtitleTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <div
      className={`
        relative w-full h-screen overflow-hidden
        bg-(--bg-primary)
        flex flex-col items-center justify-center
        transition-opacity duration-1000
        ${mounted ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* 噪点纹理背景 */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 中央光晕 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(190, 75, 219, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* 顶部装饰线 */}
      <div
        className={`
          absolute top-[15%] left-1/2 -translate-x-1/2
          h-px bg-gradient-to-r from-transparent via-(--border-color) to-transparent
          transition-all duration-1000 delay-500
          ${mounted ? 'w-32 opacity-100' : 'w-0 opacity-0'}
        `}
      />

      {/* 主标题区域 */}
      <div className="relative z-10 text-center px-8">
        {/* 日文标题 - 逐字显现 */}
        <h1 className="font-serif text-[clamp(3rem,12vw,8rem)] tracking-[0.3em] mb-6">
          {title.split('').map((char, index) => (
            <span
              key={index}
              className={`
                inline-block transition-all duration-500
                ${index < titleRevealed
                  ? 'opacity-100 translate-y-0 blur-0'
                  : 'opacity-0 translate-y-4 blur-sm'
                }
              `}
              style={{
                color: index < titleRevealed ? 'var(--text-primary)' : 'transparent',
                textShadow: index < titleRevealed ? '0 0 40px rgba(190, 75, 219, 0.3)' : 'none',
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* 英文副标题 */}
        <p
          className={`
            font-serif text-[clamp(0.75rem,2vw,1rem)] tracking-[0.6em]
            text-(--text-muted) transition-all duration-700
            ${subtitleRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {subtitle}
        </p>
      </div>

      {/* 底部装饰线 */}
      <div
        className={`
          absolute bottom-[15%] left-1/2 -translate-x-1/2
          h-px bg-gradient-to-r from-transparent via-(--border-color) to-transparent
          transition-all duration-1000 delay-700
          ${mounted ? 'w-32 opacity-100' : 'w-0 opacity-0'}
        `}
      />

      {/* 进入按钮 */}
      <button
        onClick={onEnter}
        className={`
          absolute bottom-[20%] left-1/2 -translate-x-1/2
          group flex items-center gap-3
          px-8 py-4
          font-serif text-sm tracking-[0.3em] uppercase
          text-(--text-secondary)
          border border-(--border-color)
          bg-transparent
          transition-all duration-500
          hover:border-(--accent-primary) hover:text-(--text-primary)
          hover:shadow-[0_0_30px_rgba(190,75,219,0.2)]
          ${buttonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
        `}
      >
        <span>进入调查</span>
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* 角落装饰 */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l border-t border-(--border-color) opacity-50" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r border-t border-(--border-color) opacity-50" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l border-b border-(--border-color) opacity-50" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-(--border-color) opacity-50" />
    </div>
  );
}
