import React from 'react';

export default function Features() {
  return (
    <section className="bg-slate-light py-32 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            SMARTER DECISION MAKING
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
            Equip your team with the precision tools needed to validate and execute the best ideas faster.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="w-20 h-20 bg-soft-blue text-primary rounded-2xl flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-4xl">dynamic_form</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Dynamic Criteria</h3>
            <p className="text-slate-600 leading-relaxed">
              Define custom evaluation parameters that align perfectly with your project's unique strategic goals.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 text-brand-teal rounded-2xl flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-4xl">analytics</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Predictive Scoring</h3>
            <p className="text-slate-600 leading-relaxed">
              Our proprietary AI models analyze market trends and feasibility to predict the long-term success of your ideas.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 text-accent rounded-2xl flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-4xl">hub</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Unified Insight</h3>
            <p className="text-slate-600 leading-relaxed">
              Consolidate team feedback and AI analysis into actionable dashboards for stakeholder alignment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
