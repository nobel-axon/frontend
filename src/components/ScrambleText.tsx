import { memo, useEffect, useRef, useState } from 'react';

const GLYPHS = '░▒▓█▄▀│┤╡╢╣║╗╝┐└┴┬├─┼╞╟╚╔╩╦╠═╬';

interface ScrambleTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export const ScrambleText = memo(function ScrambleText({
  text,
  delay = 0,
  duration = 600,
  className,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(() => scramble(text));
  const rafRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevTextRef = useRef(text);

  useEffect(() => {
    // Scramble immediately
    setDisplay(scramble(text));
    prevTextRef.current = text;

    timeoutRef.current = setTimeout(() => {
      const start = performance.now();

      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const revealCount = Math.floor(progress * text.length);

        let result = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') {
            result += ' ';
          } else if (i < revealCount) {
            result += text[i];
          } else {
            result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }
        setDisplay(result);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, delay, duration]);

  return <span className={className}>{display}</span>;
});

function scramble(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ') {
      result += ' ';
    } else {
      result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }
  }
  return result;
}
