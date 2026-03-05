interface AnimatedLightbulbProps {
  className?: string;
  size?: number;
}

export default function AnimatedLightbulb({
  className = '',
  size = 120,
}: AnimatedLightbulbProps) {
  const classes = `animated-lightbulb inline-flex ${className}`.trim();

  return (
    <span className={classes} aria-hidden="true">
      <svg
        className="bulb-canvas"
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bulbStrokeGradient" x1="26" y1="10" x2="94" y2="96" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" />
            <stop offset="0.5" stopColor="#FACC15" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="bulbWarmFill" x1="60" y1="96" x2="60" y2="14" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD54F" stopOpacity="0.92" />
            <stop offset="0.56" stopColor="#FFEB99" stopOpacity="0.78" />
            <stop offset="1" stopColor="#FFFDF2" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <g transform="translate(60 60) scale(0.7) translate(-60 -60)">
          <circle className="bulb-warm-glow" cx="60" cy="54" r="36" />
          <path
            className="bulb-fill"
            d="M60 10C41.2 10 26 24.6 26 42.8C26 56.2 33.1 64.6 40.9 73C45.3 77.7 46 81.5 46 86V96H74V86C74 81.5 74.7 77.7 79.1 73C86.9 64.6 94 56.2 94 42.8C94 24.6 78.8 10 60 10Z"
            fill="url(#bulbWarmFill)"
          />
          <path
            className="bulb-outline"
            d="M60 10C41.2 10 26 24.6 26 42.8C26 56.2 33.1 64.6 40.9 73C45.3 77.7 46 81.5 46 86V96H74V86C74 81.5 74.7 77.7 79.1 73C86.9 64.6 94 56.2 94 42.8C94 24.6 78.8 10 60 10Z"
          />
          <path
            className="bulb-highlight"
            d="M44 31C38.7 36.6 36.2 43.7 37 51"
          />

          <line className="bulb-base-line" x1="43" y1="103" x2="77" y2="103" />
          <line className="bulb-base-line" x1="46" y1="109" x2="74" y2="109" />
        </g>
      </svg>
    </span>
  );
}
