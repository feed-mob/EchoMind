export default function CreateSidebar() {
  return (
    <section className="hidden lg:flex w-[40%] bg-slate-50 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 relative flex-col justify-between p-12 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-icons text-white">psychology</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white uppercase">
            WIDEA
          </span>
        </div>
        <div className="space-y-6 max-w-m">
          <h1 className="text-5xl font-bold leading-tight text-slate-900 dark:text-white">
            Unlock your team's <span className="text-primary">creative potential</span>.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Set up your organization to start generating, evaluating, and executing breakthrough ideas with AI-powered insights.
          </p>
        </div>
      </div>

      {/* AI Tip Card */}
      <div className="relative z-10">
        <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 max-w-xs transform hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-2 text-primary mb-3">
            <span className="material-icons">auto_awesome</span>
            <span className="text-xs font-bold uppercase tracking-wider">AI Evaluation Tip</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            "Group management becomes effortless when AI handles the preliminary idea scoring and categorization."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <img
              alt="AI Agent"
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjMKsmeS7icxU2JtbB2eRJv7pmjmS5FkDcFpZuKmRFX46NZsaBIKRRdrPrs_uQ8zPNpRDN6qG3_zBFdA2Rnb8ZFHaTyZr1wl5RzBPHmlPoy5AyIOcLyw2tRaLLfPJFlwpchjV3CCXTEAS0YpR7lK0LrQ5vaq1iQIAY3nxGmAlbnxO-DEboRdWZX3s_JikyYqravz1-OCAqfkCjausgQD0DEedJnW7ZHp9c2GWS-WiwoLcxMUzjGE0-12wHtRysirn4qf0RIz-xTwQ"
            />
            <div>
              <p className="text-[10px] font-bold text-slate-900 dark:text-white">Core Intelligence</p>
              <p className="text-[10px] text-slate-400">Ready to assist your workspace</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
