'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import type { DashboardStats } from "@/types/dual";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-gold-dim border-t-transparent animate-spin" />
      </div>
    );
  }

  const totalValue = stats?.totalValue ?? 0;
  const totalWines = stats?.totalWines ?? 0;
  const totalActions = stats?.totalActions ?? 0;
  const activeListings = stats?.activeListings ?? 0;
  const mintedThisMonth = stats?.mintedThisMonth ?? 0;
  const topRegions = stats?.topRegions ?? [];
  const sortedTypes = [...(stats?.valueByType ?? [])].sort((a, b) => b.value - a.value);
  const topRegion = topRegions.length > 0 ? topRegions[0] : null;
  const topRegionPct = topRegion && totalWines > 0
    ? Math.round((topRegion.count / totalWines) * 100)
    : 0;

  return (
    <section className="flex-1 overflow-y-auto px-6 py-10 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* AI Sommelier Greeting */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-burgundy-accent flex items-center justify-center">
              <span
                className="material-symbols-outlined text-gold-dim text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <span className="text-sm font-semibold text-gold-dim">Sommelier AI</span>
          </div>
          <div className="pl-11">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
              {greeting}, Administrator. <br />
              The vault is{" "}
              <span
                className="italic"
                style={{
                  background: "linear-gradient(135deg, #e9c349 0%, #ffb1c1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                optimizing
              </span>
              .
            </h2>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
              Portfolio value stands at{" "}
              <span className="text-white font-mono">${totalValue.toLocaleString()}</span> across{" "}
              <span className="text-white font-mono">{totalWines}</span> tokens.
              I&apos;ve processed{" "}
              <span className="text-white font-mono">{totalActions.toLocaleString()}</span> network actions.
              {topRegion && (
                <>
                  {" "}{topRegion.region} remains your strongest asset concentration at{" "}
                  <span className="text-white font-mono">{topRegionPct}%</span>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
          {/* Market Intelligence Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:border-gold-dim/30 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <span className="material-symbols-outlined text-gold-dim group-hover:scale-110 transition-transform">
                trending_up
              </span>
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                Market Alert
              </span>
            </div>
            <h3 className="text-white font-bold mb-2">Secondary Market Peak</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              {sortedTypes.length > 0 ? (
                <>
                  {sortedTypes[0].type.charAt(0).toUpperCase() + sortedTypes[0].type.slice(1)} wines lead at{" "}
                  <span className="text-green-400">
                    ${sortedTypes[0].value.toLocaleString()}
                  </span>
                  . {activeListings} active listings across the secondary market.
                </>
              ) : (
                "Market data loading. Check back shortly for real-time portfolio insights."
              )}
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
              <Link
                href="/admin/inventory"
                className="px-3 py-1 rounded-full bg-gold-dim text-burgundy-deep text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition"
              >
                View Inventory
              </Link>
              <button className="px-3 py-1 rounded-full border border-white/10 text-[10px] text-white/60 hover:text-white transition">
                Dismiss
              </button>
            </div>
          </div>

          {/* Mint Protocol Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-burgundy-accent/30 p-6 rounded-3xl hover:border-burgundy-accent transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <span className="material-symbols-outlined text-purple-400 group-hover:scale-110 transition-transform">
                token
              </span>
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                Minting Protocol
              </span>
            </div>
            <h3 className="text-white font-bold mb-2">
              {mintedThisMonth > 0
                ? `${mintedThisMonth} Tokens Minted This Cycle`
                : "Ready to Mint"}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              {mintedThisMonth > 0
                ? "Digital certificates authenticated and anchored on DUAL Network. AI image and video generation available for new tokens."
                : "The minting pipeline is clear. Generate AI product images and cinematic videos from wine metadata using Gemini."}
            </p>
            <div className="mt-4 pt-4 border-t border-white/5">
              <Link
                href="/admin/mint"
                className="block w-full py-2 rounded-xl bg-burgundy-accent text-white text-[10px] font-bold uppercase tracking-widest text-center hover:bg-burgundy-accent/80 transition"
              >
                Mint New Token
              </Link>
            </div>
          </div>
        </div>

        {/* Strategic Summary */}
        <div className="pl-11 space-y-6">
          <div className="flex items-center gap-4 text-white/20">
            <div className="h-px flex-1 bg-current" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Strategic Summary</span>
            <div className="h-px flex-1 bg-current" />
          </div>

          <div className="space-y-1">
            {/* Portfolio Value */}
            <div className="flex items-center justify-between group cursor-help py-3">
              <div className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-gold-dim" />
                <span className="text-white/80 font-medium">Portfolio Value</span>
              </div>
              <span className="text-white/40 font-mono text-sm group-hover:text-gold-dim transition">
                ${totalValue.toLocaleString()}
              </span>
            </div>

            {/* Top Region */}
            {topRegion && (
              <div className="flex items-center justify-between group cursor-help py-3">
                <div className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-gold-dim" />
                  <span className="text-white/80 font-medium">{topRegion.region} Concentration</span>
                </div>
                <span className="text-white/40 font-mono text-sm group-hover:text-gold-dim transition">
                  {topRegionPct}% (Optimal)
                </span>
              </div>
            )}

            {/* Active Listings */}
            <div className="flex items-center justify-between group cursor-help py-3">
              <div className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-white/80 font-medium">Active Secondary Listings</span>
              </div>
              <span className="text-white/40 font-mono text-sm group-hover:text-blue-400 transition">
                {activeListings} items
              </span>
            </div>

            {/* Blockchain Sync */}
            <div className="flex items-center justify-between group cursor-help py-3">
              <div className="flex items-center gap-4 border-l-2 border-green-500/40 pl-4">
                <span className="text-white/80 font-medium">Blockchain Synchronization</span>
              </div>
              <span className="text-green-400 font-mono text-sm uppercase tracking-tighter">
                Connected
              </span>
            </div>

            {/* AI Generation */}
            <div className="flex items-center justify-between group cursor-help py-3">
              <div className="flex items-center gap-4 border-l-2 border-purple-500/40 pl-4">
                <span className="text-white/80 font-medium">AI Asset Generation</span>
              </div>
              <span className="text-purple-400 font-mono text-sm uppercase tracking-tighter">
                Gemini Ready
              </span>
            </div>
          </div>
        </div>

        {/* Wine Type Breakdown */}
        {sortedTypes.length > 0 && (
          <div className="pl-11 space-y-4">
            <div className="flex items-center gap-4 text-white/20">
              <div className="h-px flex-1 bg-current" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Value Distribution</span>
              <div className="h-px flex-1 bg-current" />
            </div>

            {/* Stacked bar */}
            <div className="w-full h-2 flex rounded-full overflow-hidden bg-white/5">
              {sortedTypes.map((item: any) => {
                const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                const colors: Record<string, string> = {
                  red: "bg-burgundy-accent",
                  white: "bg-gold-dim",
                  sparkling: "bg-amber-400",
                  "rosé": "bg-pink-400",
                  dessert: "bg-orange-400",
                  fortified: "bg-purple-400",
                };
                return (
                  <div
                    key={item.type}
                    className={`${colors[item.type] ?? "bg-white/20"} h-full`}
                    style={{ width: `${pct}%` }}
                    title={`${item.type}: $${item.value.toLocaleString()}`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6">
              {sortedTypes.map((item: any) => {
                const colors: Record<string, string> = {
                  red: "bg-burgundy-accent",
                  white: "bg-gold-dim",
                  sparkling: "bg-amber-400",
                  "rosé": "bg-pink-400",
                  dessert: "bg-orange-400",
                  fortified: "bg-purple-400",
                };
                return (
                  <div key={item.type} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors[item.type] ?? "bg-white/20"}`} />
                    <span className="text-xs text-white/40 capitalize">{item.type}</span>
                    <span className="text-xs text-white/70 font-mono">${item.value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Region Breakdown */}
        {topRegions.length > 0 && (
          <div className="pl-11 space-y-4 pb-8">
            <div className="flex items-center gap-4 text-white/20">
              <div className="h-px flex-1 bg-current" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Top Regions</span>
              <div className="h-px flex-1 bg-current" />
            </div>

            <div className="space-y-3">
              {topRegions.map((r: any) => {
                const totalCount = topRegions.reduce((s: number, x: any) => s + x.count, 0);
                const pct = totalCount > 0 ? (r.count / totalCount) * 100 : 0;
                return (
                  <div key={r.region} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60 font-medium">{r.region}</span>
                      <span className="text-white/30 font-mono">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-gold-dim to-burgundy-accent h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
