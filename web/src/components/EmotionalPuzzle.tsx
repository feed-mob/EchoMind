interface PuzzlePiece {
  id: string;
  icon: string;
  row: number;
  col: number;
  // 0: flat, 1: out, -1: in (for each side: top, right, bottom, left)
  edges: [number, number, number, number];
}

const iconPool = [
  'sentiment_satisfied', 'sentiment_very_satisfied', 'mood', 'sunny',
  'volunteer_activism', 'auto_awesome', 'workspace_premium', 'favorite',
  'star', 'lightbulb', 'emoji_emotions', 'psychology', 'self_improvement',
  'spa', 'wb_sunny', 'heart_plus', 'local_fire_department', 'rocket_launch',
  'emoji_objects', 'brightness_7', 'filter_vintage', 'flutter_dash',
];

// Generate consistent puzzle edges based on position
function generateEdge(row: number, col: number, side: number, rows: number, cols: number): number {
  // side: 0=top, 1=right, 2=bottom, 3=left

  // Border edges are flat
  if (side === 0 && row === 0) return 0;
  if (side === 1 && col === cols - 1) return 0;
  if (side === 2 && row === rows - 1) return 0;
  if (side === 3 && col === 0) return 0;

  // Matching edges: one piece's out matches neighbor's in
  // Use position-based deterministic "random"
  const seed = row * 1000 + col * 100 + side * 10;
  return (seed % 7) > 3 ? 1 : -1;
}

function generatePuzzlePieces(totalDays: number): { pieces: PuzzlePiece[]; rows: number; cols: number } {
  // Calculate grid dimensions to form a rectangle
  const cols = Math.ceil(Math.sqrt(totalDays));
  const rows = Math.ceil(totalDays / cols);

  const pieces: PuzzlePiece[] = [];
  for (let i = 0; i < totalDays; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    // Generate edges
    const top = generateEdge(row, col, 0, rows, cols);
    const right = generateEdge(row, col, 1, rows, cols);
    const bottom = generateEdge(row, col, 2, rows, cols);
    const left = generateEdge(row, col, 3, rows, cols);

    pieces.push({
      id: `p${i}`,
      icon: iconPool[i % iconPool.length],
      row,
      col,
      edges: [top, right, bottom, left],
    });
  }

  return { pieces, rows, cols };
}

// Generate SVG path for puzzle piece with curved edges
function generatePiecePath(edges: [number, number, number, number], size: number = 100): string {
  const [top, right, bottom, left] = edges;
  const tabSize = size * 0.25;
  const curveDepth = size * 0.12;

  let path = '';

  // Top edge
  if (top === 0) {
    path += `M 0 0 L ${size} 0`;
  } else if (top === 1) {
    // Outward tab
    path += `M 0 0 L ${size * 0.35} 0 Q ${size * 0.5} -${curveDepth} ${size * 0.65} 0 L ${size} 0`;
  } else {
    // Inward tab
    path += `M 0 0 L ${size * 0.35} 0 Q ${size * 0.5} ${curveDepth} ${size * 0.65} 0 L ${size} 0`;
  }

  // Right edge
  if (right === 0) {
    path += ` L ${size} ${size}`;
  } else if (right === 1) {
    path += ` L ${size} ${size * 0.35} Q ${size + curveDepth} ${size * 0.5} ${size} ${size * 0.65} L ${size} ${size}`;
  } else {
    path += ` L ${size} ${size * 0.35} Q ${size - curveDepth} ${size * 0.5} ${size} ${size * 0.65} L ${size} ${size}`;
  }

  // Bottom edge
  if (bottom === 0) {
    path += ` L 0 ${size}`;
  } else if (bottom === 1) {
    path += ` L ${size * 0.65} ${size} Q ${size * 0.5} ${size + curveDepth} ${size * 0.35} ${size} L 0 ${size}`;
  } else {
    path += ` L ${size * 0.65} ${size} Q ${size * 0.5} ${size - curveDepth} ${size * 0.35} ${size} L 0 ${size}`;
  }

  // Left edge
  if (left === 0) {
    path += ` L 0 0`;
  } else if (left === 1) {
    path += ` L 0 ${size * 0.65} Q ${size - curveDepth} ${size * 0.5} 0 ${size * 0.35} L 0 0`;
  } else {
    path += ` L 0 ${size * 0.65} Q ${curveDepth} ${size * 0.5} 0 ${size * 0.35} L 0 0`;
  }

  return path;
}

interface EmotionalPuzzleProps {
  completedDays?: number;
  totalDays?: number;
  quote?: string;
  onGetReward?: () => void;
}

export default function EmotionalPuzzle({
  completedDays = 0,
  totalDays = 0,
  quote = "Every step forward is progress. Keep going!",
  onGetReward
}: EmotionalPuzzleProps) {
  const isComplete = completedDays >= totalDays;

  const { pieces: puzzlePieces, rows, cols } = generatePuzzlePieces(totalDays || 7);

  const handleGetReward = () => {
    if (onGetReward) {
      onGetReward();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Emotional Accumulation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete {totalDays} days of positive logs to unlock your reward.
          </p>
        </div>
        <div className={`px-3 py-1 text-xs font-bold rounded-full ${
          isComplete
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
        }`}>
          {completedDays}/{totalDays} {isComplete ? 'COMPLETE' : 'DAYS'}
        </div>
      </div>

      {/* Puzzle Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative min-h-[550px]">
        <div className="puzzle-container group relative h-full">
          {/* Puzzle Wrapper */}
          <div className="puzzle-wrapper">
            {puzzlePieces.map((piece, index) => {
              // Calculate exact grid position
              const col = index % cols;
              const row = Math.floor(index / cols);

              // Calculate position percentages to form a seamless grid
              const left = (col / cols) * 100;
              const top = (row / rows) * 100;
              const width = (1 / cols) * 100;
              const height = (1 / rows) * 100;

              // Generate SVG path for this piece
              const piecePath = generatePiecePath(piece.edges, 100);

              return (
                <div
                  key={piece.id}
                  className="puzzle-piece-custom"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    backgroundColor: `hsl(${200 + ((index * 137.5) % 160)}, 70%, ${45 + (index % 3) * 10}%)`,
                    clipPath: `path('${piecePath}')`,
                    animationDelay: `${index * 0.05}s`,
                    zIndex: index,
                  }}
                >
                  <span
                    className="material-icons text-3xl"
                    style={{ opacity: 0.85, fontSize: 'min(3rem, 5vw)' }}
                  >
                    {piece.icon}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quote Overlay */}
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
            <div className="max-w-md">
              <span className="material-icons text-primary mb-2 text-4xl">format_quote</span>
              <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white italic leading-tight">
                "{quote}"
              </p>
            </div>
          </div>

          {/* Reward Button */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
            <button
              onClick={handleGetReward}
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-black text-xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all flex items-center gap-3"
              disabled={isComplete}
            >
              <span className="material-icons animate-bounce">card_giftcard</span>
              Get Reward
              <div className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
            </button>
          </div>

        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .puzzle-container {
          position: relative;
          width: 100%;
          height: 500px;
          margin: 0 auto;
          background-color: transparent;
          overflow: hidden;
        }

        .puzzle-piece-custom {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.8);
          transition: transform 0.3s ease, opacity 0.3s ease;
          animation: fadeInScale 0.5s ease-out forwards;
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .puzzle-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
        }

        /* Dynamic puzzle pieces - sizing and positioning calculated based on totalDays */
        .puzzle-wrapper .puzzle-piece-custom {
          width: var(--piece-width, 100%);
          height: var(--piece-height, 100%);
        }

        .dark .puzzle-piece-custom {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
