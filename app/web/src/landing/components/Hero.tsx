import React from 'react';

export default function Hero() {
  return (
    <section className="relative hero-gradient min-h-[90vh] flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 py-20">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Next-Gen Collaborative Strategy
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            AI-POWERED IDEATION: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-brand-teal">
              PICK THE WINNING IDEAS
            </span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed">
            Stop guessing. Use high-fidelity AI evaluation to filter through the noise. Turn your team's creative sparks into market-ready strategic assets with real-time scoring.
          </p>
        </div>

        <div className="relative py-12 w-full">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-6 py-3 rounded-full shadow-lg z-20 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Goal:</span>
            <span className="text-sm font-bold text-slate-900">Maximize Market Penetration</span>
          </div>
          <div className="relative bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 shadow-inner w-full">
            <div className="grid gap-4">
              <div className="idea-card winner p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="material-icons text-xs">auto_awesome</span>
                  AI PICK
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="material-icons text-primary">lightbulb</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary">94.2</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Confidence Score</div>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Omni-Channel Customer Hub</h4>
                <p className="text-sm text-slate-600 mb-4">Leveraging L2 scaling to unify disparate communication silos into a single source of truth.</p>
                <div className="flex gap-2">
                  <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '96%' }}></div>
                  </div>
                  <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>

              <div className="idea-card p-6 rounded-2xl opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="material-icons text-slate-400">inventory_2</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-400">76.8</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Confidence Score</div>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Automated Inventory Pivot</h4>
                <p className="text-sm text-slate-500">Traditional ERP integration with seasonal forecasting modules.</p>
              </div>

              <div className="idea-card p-6 rounded-2xl opacity-50 grayscale-[0.8] hover:opacity-100 hover:grayscale-0 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="material-icons text-slate-400">campaign</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-400">62.1</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Confidence Score</div>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Viral Incentive Loops</h4>
                <p className="text-sm text-slate-500">Social-first referral program targeting Gen-Z demographics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
