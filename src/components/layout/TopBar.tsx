// src/components/layout/TopBar.tsx
import { TimeDisplay } from "../ui/TimeDisplay";
import { ThemeToggle } from "../ui/ThemeToggle";
import type { ExposureInfo } from "../../types/api";

interface TopBarProps {
  currentTimeMinute: number;
  exposure: ExposureInfo;
  narrativeText?: string | null;
}

/** 将游戏分钟数转为等效 Date（用于 TimeDisplay 兼容） */
function minuteToDate(minutes: number): Date {
  const baseDate = new Date("1924-10-15T00:00:00");
  return new Date(baseDate.getTime() + minutes * 60 * 1000);
}

function getTimePeriod(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 24;
  if (hour >= 5 && hour < 11) return "早晨";
  if (hour >= 11 && hour < 14) return "中午";
  if (hour >= 14 && hour < 18) return "下午";
  if (hour >= 18 && hour < 21) return "傍晚";
  return "夜晚";
}

export function TopBar({
  currentTimeMinute,
  exposure,
  narrativeText,
}: TopBarProps) {
  const date = minuteToDate(currentTimeMinute);
  const timePeriod = getTimePeriod(currentTimeMinute);

  return (
    <header className="h-15 bg-(--bg-secondary) border-b border-(--border-color) px-6 flex items-center justify-between shrink-0">
      {/* 左侧：时间 */}
      <TimeDisplay date={date} timePeriod={timePeriod} weather="雨" />

      {/* 中间：局势提示 / narrative */}
      <div className="hidden md:flex items-center max-w-md px-6">
        <span className="text-sm text-(--text-secondary) text-center line-clamp-1">
          {narrativeText || `暴露度: ${exposure.value}% (${exposure.level})`}
        </span>
      </div>

      {/* 右侧：主题切换按钮 */}
      <div className="flex items-center justify-end w-24">
        <ThemeToggle />
      </div>
    </header>
  );
}
