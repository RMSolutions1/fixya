import { cn } from '@/lib/utils';

interface SolDeMayoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

/** Sol de Mayo estilizado — escudo argentino */
export function SolDeMayo({ className, size = 48, animated = false }: SolDeMayoProps) {
  const rays = 16;
  const rayPaths = Array.from({ length: rays }, (_, i) => {
    const angle = (i * 360) / rays;
    const rad = (angle * Math.PI) / 180;
    const innerR = size * 0.38;
    const outerR = size * 0.5;
    const x1 = size / 2 + innerR * Math.cos(rad);
    const y1 = size / 2 + innerR * Math.sin(rad);
    const x2 = size / 2 + outerR * Math.cos(rad);
    const y2 = size / 2 + outerR * Math.sin(rad);
    const perpRad = rad + Math.PI / 2;
    const w = size * 0.04;
    const cx1 = x1 + w * Math.cos(perpRad);
    const cy1 = y1 + w * Math.sin(perpRad);
    const cx2 = x1 - w * Math.cos(perpRad);
    const cy2 = y1 - w * Math.sin(perpRad);
    return `M ${cx1} ${cy1} L ${x2} ${y2} L ${cx2} ${cy2} Z`;
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn(animated && 'animate-sun-pulse', className)}
      aria-hidden
    >
      <defs>
        <radialGradient id={`sol-face-${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#F5A623" />
        </radialGradient>
      </defs>
      <g fill={`url(#sol-face-${size})`}>
        {rayPaths.map((d, i) => (
          <path key={i} d={d} />
        ))}
        <circle cx={size / 2} cy={size / 2} r={size * 0.28} />
      </g>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size * 0.12}
        fill="none"
        stroke="#1a4d6d"
        strokeWidth={size * 0.015}
        opacity={0.3}
      />
    </svg>
  );
}
