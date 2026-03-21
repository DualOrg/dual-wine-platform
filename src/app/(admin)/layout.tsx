import AdminNav from "@/components/layout/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-vault-bg text-gray-200 overflow-hidden">
      <AdminNav />
      <main className="flex-1 flex flex-col relative h-full">
        {/* Top header bar */}
        <header className="h-14 flex items-center justify-between px-10 border-b border-white/5 bg-vault-bg/50 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-[0.3em] font-bold text-gold-dim uppercase">
              Vault Intelligence System v4.0
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-500 font-mono uppercase tracking-widest">
                Oracle Live
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Status ticker */}
        <div className="bg-black/40 border-t border-white/5 py-2 px-10 flex items-center justify-between text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] flex-shrink-0">
          <div className="flex items-center gap-8 overflow-hidden">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gold-dim" /> DUAL Network · Connected
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-green-400" /> Oracle: Active
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-purple-400" /> Gemini AI: Ready
            </span>
          </div>
          <div className="flex-shrink-0">
            DUAL Token Contract
          </div>
        </div>
      </main>
    </div>
  );
}
