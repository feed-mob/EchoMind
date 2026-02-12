import LandingHeader from '@/app/_components/landing/LandingHeader';

export default function Home() {
  return (
    <div className="bg-white text-slate-800 font-display antialiased">
      <LandingHeader />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: 'radial-gradient(circle at 70% 30%, #f0f9ff 0%, #ffffff 100%)' }}>
          <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 py-20">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-soft-blue border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold text-primary">
                <span className="material-icons text-lg">auto_awesome</span>
                AI-Powered Ideation
              </div>
              <h1 className="text-6xl font-black leading-tight text-slate-900">
                Turn Ideas Into
                <span className="block text-primary">Winning Strategies</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Collaborate with your team and AI to brainstorm, evaluate, and refine ideas faster than ever before.
              </p>
              <div className="flex gap-4">
                <button className="bg-primary hover:bg-accent text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all">
                  Get Started Free
                </button>
                <button className="bg-white border-2 border-slate-200 hover:border-primary text-slate-700 font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Demo Card */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Marketing Campaign Ideas</h3>
                  <span className="bg-soft-blue text-primary text-xs font-bold px-3 py-1 rounded-full">AI Evaluated</span>
                </div>

                <div className="space-y-4">
                  {/* Winner Card */}
                  <div className="bg-soft-blue border-2 border-primary rounded-xl p-5 shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1">Influencer Partnership Series</h4>
                        <p className="text-sm text-slate-600">Collaborate with micro-influencers for authentic reach</p>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}>
                        <span className="material-icons text-sm">star</span>
                        9.2
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-white/60 text-primary px-2 py-1 rounded-md font-semibold">High Impact</span>
                      <span className="bg-white/60 text-primary px-2 py-1 rounded-md font-semibold">Cost Effective</span>
                    </div>
                  </div>

                  {/* Other Ideas */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1">Social Media Contest</h4>
                        <p className="text-sm text-slate-600">User-generated content campaign</p>
                      </div>
                      <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-bold">
                        7.8
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1">Email Drip Campaign</h4>
                        <p className="text-sm text-slate-600">Automated nurture sequence</p>
                      </div>
                      <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-bold">
                        7.5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-black text-slate-900 mb-6">How WIDEA Works</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                A seamless workflow that transforms brainstorming chaos into structured, actionable insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white rounded-2xl p-10 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-soft-blue rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-primary">group_add</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Collaborative Brainstorming</h3>
                <p className="text-slate-600 leading-relaxed">
                  Invite your team to contribute ideas in real-time. Everyone's voice matters in the creative process.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-10 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-soft-blue rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-primary">psychology</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">AI-Powered Evaluation</h3>
                <p className="text-slate-600 leading-relaxed">
                  Let AI analyze ideas against your custom criteria, providing objective scores and insights instantly.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-10 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-soft-blue rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-primary">hub</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Unified Insight</h3>
                <p className="text-slate-600 leading-relaxed">
                  Consolidate team feedback and AI analysis into actionable dashboards for stakeholder alignment.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-icons text-white text-lg">psychology</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">WIDEA</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-semibold text-slate-500 mb-12">
            <a className="hover:text-primary transition-colors" href="#">Platform</a>
            <a className="hover:text-primary transition-colors" href="#">Security</a>
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
          </div>
          <div className="w-full pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-slate-400">© 2026 WIDEA. Elevating collective intelligence.</p>
            <div className="flex gap-6">
              <a className="text-slate-300 hover:text-primary transition-colors" href="#">
                <span className="material-icons text-xl">facebook</span>
              </a>
              <a className="text-slate-300 hover:text-primary transition-colors" href="#">
                <span className="material-icons text-xl">alternate_email</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
