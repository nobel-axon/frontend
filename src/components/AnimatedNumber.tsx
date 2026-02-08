import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  formatter: (n: number) => string;
  duration?: number;
}

export function AnimatedNumber({ value, formatter, duration = 1000 }: AnimatedNumberProps) {
  const prevRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [display, setDisplay] = useState(() => formatter(value));

  useEffect(() => {
    // First render or no previous value — snap immediately
    if (prevRef.current === null) {
      prevRef.current = value;
      setDisplay(formatter(value));
      return;
    }

    const from = prevRef.current;
    const to = value;
    prevRef.current = value;

    // No change — skip animation
    if (from === to) return;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(formatter(current));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, formatter, duration]);

  return <span>{display}</span>;
}
