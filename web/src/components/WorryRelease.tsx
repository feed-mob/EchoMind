import { useState } from 'react';


const worryItems = [
  { text: 'Work stress', rotation: -12 },
  { text: 'Overthinking', rotation: 8 },
  { text: 'Deadline', rotation: -5 },
  { text: 'Tiredness', rotation: 15 },
  { text: 'Social anxiety', rotation: -10 },
  { text: 'Poor sleep', rotation: 4 },
  { text: 'Expectations', rotation: -18 },
  { text: 'Finances', rotation: 7 },
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

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative min-h-[650px]">
        {/* Bulging Trash Bin Visual */}
        <div className="bin-container group relative h-full">
          <div className="relative mt-32">
            {/* Detailed Premium Lid */}
            <div className="bin-lid-handle"></div>
            <div className="bin-lid-top"></div>

            {/* Trash Bin Body */}
            <div className="trash-bin">
              {/* 5 Vertical Panels */}
              <div className="bin-panel"></div>
              <div className="bin-panel"></div>
              <div className="bin-panel"></div>
              <div className="bin-panel"></div>
              <div className="bin-panel"></div>

              {/* Worries Inside (80% transparent via CSS) */}
              <div className={`bin-contents transition-all duration-1000 ${isReleasing ? 'opacity-0 translate-y-10' : ''}`}>
                {worryItems.map((item, index) => (
                  <div className="worry-wrapper">

                    <span
                      key={index}
                      className="worry-item"
                      style={{
                        transform: `rotate(${item.rotation}deg)`,
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
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
          width: 200px;
          height: 260px;
          background: #cbd5e1;
          border-radius: 4px 4px 40px 40px;
          box-shadow: inset -10px -10px 20px rgba(0,0,0,0.05), 0 10px 25px -5px rgba(0,0,0,0.1);
          z-index: 10;
          display: flex;
          justify-content: space-evenly;
          padding: 20px 10px 0;
          overflow: hidden;
        }

        .bin-panel {
          width: 15%;
          height: 80%;
          margin-top: auto;
          margin-bottom: auto;
          background: rgba(0,0,0,0.05);
          border-radius: 2px;
        }

        .bin-contents {
          position: absolute;
          bottom: 5px;
          left: 0;
          right: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          padding: 10px;
          gap: 4px;
          z-index: 11;
          opacity: 0.4;
        }

        /* Premium Lid Design */
        .bin-lid-top {
          position: absolute;
          top: -15px;
          left: -15px;
          right: -15px;
          height: 20px;
          background: #94a3b8;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          z-index: 15;
        }

        .bin-lid-handle {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 12px;
          background: #64748b;
          border-radius: 6px 6px 0 0;
          z-index: 14;
        }

        .worry-wrapper {
          transition: transform 0.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-child(n) {
          transform: translateY(-14px);
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(1) {
          transform: translateY(-3px);
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(2) {
          transform: translateY(-6px);
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(3) {
          transform: translateY(-8px);
        }


        .worry-item {
          display: inline-block;
          font-size: 14px;
          font-weight: 800;
          color: #314158;
          background: white;
          padding: 6px 12px;
          border-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          white-space: nowrap;
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-6deg); }
          40% { transform: rotate(6deg); }
          60% { transform: rotate(-4deg); }
          80% { transform: rotate(4deg); }
        }

        @keyframes jampp {
          0%, 100% { transform: translateY(0px); }
          10% { transform: translateY(-6px); }
        }

        .dark .trash-bin { background: #334155; }
        .dark .bin-lid-top { background: #475569; }
        .dark .bin-lid-handle { background: #64748b; }
        .dark .bin-panel { background: rgba(255,255,255,0.05); }
        .dark .worry-item { background: #0f172a; color: #cbd5e1; }
      `}</style>
    </div>
  );
}
