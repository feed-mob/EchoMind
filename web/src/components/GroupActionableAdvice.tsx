export default function GroupActionableAdvice() {
  return (
    <div className="bg-primary p-6 rounded-xl text-white shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 group-hover:scale-110 transition-transform duration-500">
        <span className="material-symbols-outlined text-[120px]">verified</span>
      </div>
      <div className="relative z-10">
        <h3 className="font-bold text-lg mb-2">Actionable Advice</h3>
        <p className="text-blue-100 text-sm leading-relaxed mb-6">
          Schedule a brief 'No-Meeting Wednesday' for the Engineering team to
          improve deep work focus, as mid-week stress levels are slightly
          elevated.
        </p>
        <button className="px-4 py-2 bg-white text-primary rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
          Implement Recommendation
        </button>
      </div>
    </div>
  );
}
