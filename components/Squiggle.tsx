interface SquiggleProps {
  width?: number;
  height?: number;
  color?: string;
  style?: React.CSSProperties;
}

export function Squiggle({ width = 220, height = 22, color = "var(--blue-pop)", style }: SquiggleProps) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style} aria-hidden="true">
      <path
        d={`M 4 ${height / 2} Q ${width * 0.2} 4 ${width * 0.4} ${height / 2} T ${width * 0.8} ${height / 2} T ${width - 4} ${height / 2}`}
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}
