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

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative min-h-[600px]">
        {/* Bulging Trash Bin Visual */}
        <div className="bin-container group relative h-full">
          <div className={`relative bin-container-wrapper ${isReleasing ? 'lid-tilt' : ''}`}>
            {/* Detailed Premium Lid */}
            <div className={`bin-lid flex flex-col items-center z-20 ${isReleasing ? 'lid-open' : ''}`}>
              <div className="bin-lid-handle"></div>
              <div className="bin-lid-top"></div>
            </div>

            {/* Trash Bin Body */}
            <div className="trash-bin">
              {/* 5 Vertical Panels */}
              <div className="bin-panel"></div>
              <div className="bin-panel"></div>
              <div className="bin-panel"></div>
              <div className="bin-panel"></div>
              <div className="bin-panel"></div>

              {/* Worries Inside (80% transparent via CSS) */}
              <div className="bin-contents">
                {worryItems.map((item, index) => (
                  <div
                    key={index}
                    className={`worry-wrapper ${isReleasing ? 'worry-burst' : ''}`}
                    style={{
                      '--burst-delay': `${index * 0.05}s`,
                      '--burst-x': `${(Math.random() - 0.5) * 300}px`,
                      '--burst-rotate': `${(Math.random() - 0.5) * 360}deg`,
                    } as React.CSSProperties}
                  >
                    <span
                      className={`worry-item ${isReleasing ? 'worry-shatter' : ''}`}
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
        .bin-contents.opacity-0 {
          opacity: 0;
        }

        /* Premium Lid Design */
        .bin-lid {
          position: absolute;
          top: -15px;
          left: -15px;
          right: -15px;
        }
        .bin-lid-top {
          height: 20px;
          width: 100%;
          background: #94a3b8;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          z-index: 15;
        }

        .bin-lid-handle {
          width: 60px;
          height: 12px;
          background: #64748b;
          border-radius: 6px 6px 0 0;
          z-index: 14;
        }

        .bin-container-wrapper.lid-tilt {
          animation: tilt 1s ease-in-out 0.6s forwards;
        }

        @keyframes tilt {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(65deg);
          }
        }

        .bin-container-wrapper:hover .bin-lid:not(.lid-open){
          animation: shake 0.6s ease-in-out;
        }

        /* Lid opening animation - pivot from left edge */
        .bin-lid.lid-open {
          animation: lidOpen 0.5s ease-out forwards;
          transform-origin: left center;
        }

        @keyframes lidOpen {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-75deg);
          }
        }

        .worry-wrapper {
          transition: transform 0.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-child(n) {
          animation: jampp-4 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(1) {
          animation: jampp 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(2) {
          animation: jampp-1 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(3) {
          animation: jampp-2 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(4) {
          animation: jampp-3 1.2s ease-in-out;
        }
        .trash-bin:hover .worry-wrapper:nth-last-child(5) {
          animation: jampp-3 1.2s ease-in-out;
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
          20% { transform: rotate(-3deg); }
          40% { transform: rotate(3deg); }
          60% { transform: rotate(-2deg); }
          80% { transform: rotate(2deg); }
        }

        @keyframes jampp {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-5px); }
        }

        @keyframes jampp-1 {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-6px); }
        }

        @keyframes jampp-2 {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-8px); }
        }

        @keyframes jampp-3 {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-14px); }
        }
        @keyframes jampp-4 {
          0%, 100% { transform: translateY(0px); }
          15% { transform: translateY(-20px); }
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
