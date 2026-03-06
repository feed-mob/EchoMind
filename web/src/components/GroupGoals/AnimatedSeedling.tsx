interface AnimatedSeedlingProps {
  className?: string;
  size?: number;
}

export default function AnimatedSeedling({
  className = '',
  size = 120,
}: AnimatedSeedlingProps) {
  const classes = `animated-seedling inline-flex ${className}`.trim();

  return (
    <span className={classes} aria-hidden="true">
      <svg
        className="seedling-canvas"
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="seedlingStem" x1="60" y1="92" x2="60" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#15803D" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id="seedlingLeaf" x1="40" y1="46" x2="80" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#86EFAC" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
        </defs>

        <path className="seedling-stem" d="M60 92V64" stroke="url(#seedlingStem)" strokeWidth="5" strokeLinecap="round" />

        <g className="seedling-leaf seedling-leaf-left">
          <path
            d="M60 66C45 66 36 57 36 45C47 45 57 50 60 62"
            fill="url(#seedlingLeaf)"
          />
        </g>
        <g className="seedling-leaf seedling-leaf-right">
          <path
            d="M60 62C63 50 73 45 84 45C84 57 75 66 60 66"
            fill="url(#seedlingLeaf)"
          />
        </g>
      </svg>
    </span>
  );
}
