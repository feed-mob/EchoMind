export default function LandingHeader() {
  return (
    <header className="w-full py-6 px-8 flex justify-between items-center max-w-7xl mx-auto sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="material-icons text-white text-2xl">psychology</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">WIDEA</span>
      </div>
      <div className="hidden md:flex gap-10 text-sm font-semibold text-slate-500">
        <a className="hover:text-primary transition-colors" href="#">
          Features
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          Pricing
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          Solutions
        </a>
      </div>
      <div>
        <button className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all px-5 py-3 rounded-xl text-slate-700 font-bold text-m group">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            ></path>
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            ></path>
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            ></path>
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            ></path>
          </svg>
          Continue with Google
        </button>
      </div>
    </header>
  );
}
