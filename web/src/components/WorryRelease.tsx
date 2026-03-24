import { useState } from 'react';


const worryItems = [
  { text: 'Work stress', rotation: -5 },
  { text: 'Overthinking', rotation: 3 },
  { text: 'Deadline', rotation: -2 },
  { text: 'Tiredness', rotation: 4 },
  { text: 'Social anxiety', rotation: -8 },
  { text: 'Poor sleep', rotation: 2 },
];


interface WorryReleaseProps {
  completedDays?: number;
  totalDays?: number;
  onDump?: () => void;
}

export default function WorryRelease({
    completedDays = 0,
    totalDays = 0,
    onDump
  }: WorryReleaseProps) {
  const [isReleasing, setIsReleasing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleRelease = () => {
    setIsReleasing(true);
    setTimeout(() => {
      setShowThankYou(true);
      if(onDump){
        onDump()
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Release Your Worries</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Feeling overwhelmed? Let&apos;s clear some mental space.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative min-h-[550px]">
        {/* Bulging Trash Bin Visual */}
        <div className="bin-container group relative h-full">
          <div className="relative mt-20">
            {/* Bulging Content */}
            <div className="bulge-content">
              {worryItems.map((item, index) => (
                <span
                  key={index}
                  className={`worry-item transition-all duration-1000 ${isReleasing ? 'opacity-0 translate-y-10' : ''}`}
                  style={{
                    transform: `rotate(${item.rotation}deg)`,
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  {item.text}
                </span>
              ))}
            </div>

            {/* Trash Bin */}
            <div className="trash-bin">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400/30 text-6xl">delete_outline</span>
              </div>
            </div>
          </div>

          {/* Quote Overlay */}
          {!showThankYou ? (
            <div className="absolute inset-x-0 top-12 flex items-center justify-center p-6 text-center">
              <div className="max-w-md">
                <p className="text-xl font-medium text-slate-500 dark:text-slate-400 leading-tight">
                  &ldquo;Letting go isn&apos;t giving up, it&apos;s making room for better things.&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-x-0 top-12 flex items-center justify-center p-6 text-center">
              <div className="max-w-md">
                <span className="material-symbols-outlined text-6xl text-primary mb-4">check_circle</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Worries Released</p>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-tight">
                  Take a deep breath. You&apos;ve taken the first step toward a lighter mind.
                </p>
              </div>
            </div>
          )}

          {/* Release Button */}
          {!showThankYou && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
              <button
                onClick={handleRelease}
                disabled={isReleasing}
                className="group relative px-10 py-5 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-black text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <span className="material-symbols-outlined">delete_sweep</span>
                Release Your Worries
                <div className="absolute inset-0 rounded-xl bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS for the trash bin animation */}
      <style>{`
        .bin-container {
          position: relative;
          width: 100%;
          height: 100%;
          margin: 0 auto;
          background-color: transparent;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trash-bin {
          position: relative;
          width: 180px;
          height: 240px;
          background: #cbd5e1;
          border-radius: 20px 20px 40px 40px;
          box-shadow: inset -15px 0 20px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .trash-bin::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          height: 20px;
          background: #94a3b8;
          border-radius: 10px;
        }

        .bulge-content {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 220px;
          height: 120px;
          background: #e2e8f0;
          border-radius: 50% 50% 0 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-content: flex-start;
          padding-top: 20px;
          overflow: visible;
          z-index: 5;
        }

        .worry-item {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          background: white;
          padding: 4px 8px;
          border-radius: 12px;
          margin: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          white-space: nowrap;
        }

        .dark .trash-bin { background: #334155; }
        .dark .trash-bin::before { background: #475569; }
        .dark .bulge-content { background: #1e293b; }
        .dark .worry-item { background: #0f172a; color: #94a3b8; }
      `}</style>
    </div>
  );
}
