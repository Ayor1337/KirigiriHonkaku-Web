// src/components/ui/TimeDisplay.tsx
interface TimeDisplayProps {
  date: Date;
  timePeriod: string;
  weather: string;
}

export function TimeDisplay({ date, timePeriod, weather }: TimeDisplayProps) {
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const formatTime = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col">
      <div className="font-mono text-lg text-[var(--text-primary)] tracking-wider">
        {formatDate(date)}
      </div>
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <span>{formatTime(date)}</span>
        <span className="text-[var(--border-color)]">|</span>
        <span>{timePeriod}</span>
        <span className="text-[var(--border-color)]">|</span>
        <span>{weather}</span>
      </div>
    </div>
  );
}
