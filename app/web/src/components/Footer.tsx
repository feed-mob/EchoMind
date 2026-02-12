export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-icons text-white text-lg">psychology</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">WIDEA</span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-semibold text-slate-500 mb-12">
          <a className="hover:text-primary transition-colors" href="#platform">Platform</a>
          <a className="hover:text-primary transition-colors" href="#security">Security</a>
          <a className="hover:text-primary transition-colors" href="#privacy">Privacy</a>
          <a className="hover:text-primary transition-colors" href="#terms">Terms</a>
        </div>

        <div className="w-full pt-10 border-t border-slate-100 flex flex-col md:row justify-between items-center gap-6">
          <p className="text-sm text-slate-400">© 2026 WIDEA. Elevating collective intelligence.</p>
        </div>
      </div>
    </footer>
  );
}
