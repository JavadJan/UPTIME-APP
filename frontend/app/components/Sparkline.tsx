import { CheckResult } from '../lib/types';

const WIDTH = 120;
const HEIGHT = 28;

export function Sparkline({ history }: { history: CheckResult[] }) {
  const points = [...history].reverse().filter((h) => h.responseMs != null);

  if (points.length < 2) {
    return (
      <svg width={WIDTH} height={HEIGHT} role="img" aria-label="Not enough data yet">
        <line
          x1={0}
          y1={HEIGHT - 1}
          x2={WIDTH}
          y2={HEIGHT - 1}
          stroke="var(--border-strong)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const values = points.map((p) => p.responseMs as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * WIDTH;
    const y = HEIGHT - ((p.responseMs! - min) / range) * (HEIGHT - 4) - 2;
    return { x, y, down: p.status === 'DOWN' };
  });

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const anyDown = coords.some((c) => c.down);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      role="img"
      aria-label={`Response time trend, ${min} to ${max} milliseconds`}
    >
      <path d={path} fill="none" stroke={anyDown ? 'var(--down)' : 'var(--accent)'} strokeWidth={1.5} />
      {coords
        .filter((c) => c.down)
        .map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={2} fill="var(--down)" />
        ))}
    </svg>
  );
}
