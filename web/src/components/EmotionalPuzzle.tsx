import { MIN_PUZZLE_DAYS } from "../config/constants";

interface PuzzlePiece {
  id: string;
  icon: string;
  className: string;
  iconTransform: string;
}

const puzzlePieces: PuzzlePiece[] = [
  { id: 'p1', icon: 'sentiment_satisfied', className: 'p1-new', iconTransform: 'translate(-100px, -100px)' },
  { id: 'p2', icon: 'sentiment_very_satisfied', className: 'p2-new', iconTransform: 'translate(100px, -112px)' },
  { id: 'p3', icon: 'mood', className: 'p3-new', iconTransform: 'translate(50px, -25px)' },
  { id: 'p4', icon: 'sunny', className: 'p4-new', iconTransform: 'translate(-100px, 50px)' },
  { id: 'p5', icon: 'volunteer_activism', className: 'p5-new', iconTransform: 'translate(75px, 37px)' },
  { id: 'p6', icon: 'auto_awesome', className: 'p6-new', iconTransform: 'translate(-12px, 87px)' },
  { id: 'p7', icon: 'workspace_premium', className: 'p7-new', iconTransform: 'translate(62px, 100px)' },
];

interface EmotionalPuzzleProps {
  completedDays?: number;
  totalDays?: number;
  quote?: string;
  onGetReward?: () => void;
}

export default function EmotionalPuzzle({
  completedDays = 7,
  totalDays = MIN_PUZZLE_DAYS,
  quote = "Every step forward is progress. Keep going!",
  onGetReward
}: EmotionalPuzzleProps) {
  const isComplete = completedDays >= totalDays;

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
            {puzzlePieces.map((piece) => (
              <div key={piece.id} className={`puzzle-piece-custom ${piece.className}`}>
                <span
                  className="material-icons text-3xl"
                  style={{ transform: piece.iconTransform }}
                >
                  {piece.icon}
                </span>
              </div>
            ))}
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
          {isComplete && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
              <button
                onClick={handleGetReward}
                className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-black text-xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all flex items-center gap-3"
              >
                <span className="material-icons animate-bounce">card_giftcard</span>
                Get Reward
                <div className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              </button>
            </div>
          )}
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
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          transition: transform 0.3s ease;
        }

        .puzzle-wrapper {
          position: relative;
          width: 400px;
          height: 400px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
        }

        /* 7 Pieces with irregular, curved, and tilted boundaries using clip-path */
        .p1-new {
          clip-path: path('M0,0 L225,0 C212,50 237,100 187,137 C137,175 87,150 50,200 C25,225 0,212 0,250 Z');
          background-color: #1e40af;
        }
        .p2-new {
          clip-path: path('M225,0 L400,0 L400,175 C350,162 300,200 262,162 C225,125 250,75 225,0 Z');
          background-color: #1d4ed8;
        }
        .p3-new {
          clip-path: path('M187,137 C237,100 212,50 225,0 C250,75 225,125 262,162 C300,200 350,162 400,175 L400,250 L300,275 C275,225 225,237 187,262 C150,287 137,212 187,137 Z');
          background-color: #2563eb;
        }
        .p4-new {
          clip-path: path('M0,250 C0,212 25,225 50,200 C87,150 137,175 187,137 C137,212 150,287 187,262 L175,400 L0,400 Z');
          background-color: #3b82f6;
        }
        .p5-new {
          clip-path: path('M400,250 L400,325 C350,325 325,287 275,312 C225,337 212,287 187,262 C225,237 275,225 300,275 L400,250 Z');
          background-color: #60a5fa;
        }
        .p6-new {
          clip-path: path('M175,400 L187,262 C212,287 225,337 275,312 L300,400 Z');
          background-color: #93c5fd;
        }
        .p7-new {
          clip-path: path('M300,400 L275,312 C325,287 350,325 400,325 L400,400 Z');
          background-color: #bfdbfe;
        }

        .dark .puzzle-piece-custom {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
