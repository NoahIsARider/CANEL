import { useState, useEffect } from 'react';
import { formatTime, formatDate } from '../../utils';

export function ClockCard() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="text-[32px] font-semibold text-ink mb-2 font-mono">
        {formatTime(now)}
      </div>
      <div className="text-caption text-ink-secondary">
        {formatDate(now)}
      </div>
      <div className="text-caption text-ink-tertiary mt-1">
        {timezone}
      </div>
    </div>
  );
}
