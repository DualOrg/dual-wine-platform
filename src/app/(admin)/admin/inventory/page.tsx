'use client';

import { useState, useEffect } from "react";
import type { Wine } from "@/types/dual";
import Link from "next/link";

function truncateHash(hash: string, length: number = 8): string {
  if (!hash) return '';
  return hash.length > length ? `${hash.slice(0, length)}...` : hash;
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  minted: "bg-blue-100 text-blue-700",
  anchoring: "bg-amber-100 text-amber-700",
  anchored: "bg-emerald-100 text-emerald-700",
  listed: "bg-purple-100 text-purple-700",
  sold: "bg-indigo-100 text-indigo-700",
  transferred: "bg-cyan-100 text-cyan-700",
  redeemed: "bg-slate-100 text-slate-600",
  burned: "bg-red-100 text-red-700",
};

const anchoredStatusBg: Record<string, string> = {
  anchored: "bg-emerald-500/10 border-emerald-500/30",
  default: "bg-slate-500/5 border-slate-300/20",
};

export default function InventoryPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/wines")
      .then((r: any) => r.json())
      .then((data: any) => { setWines(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = wines
    .filter((w: any) => statusFilter === "all" || w.status === statusFilter)
    .filter((w: any) => !search || w.wineData.name.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search));

  const anchoredCount = wines.filter((w: any) => w.status === 'anchored').length;
  const mintedCount = wines.filter((w: any) => w.status === 'minted').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-emerald-500/20 sticky top-0 z-20">
        <div className="h-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-2xl">verified</span>
              <div>
                <div className="text-sm text-slate-300 font-semibold">DUAL Network</div>
                <div className="text-xs text-slate-500">{wines.length} Wine Tokens</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-emerald-400 transition">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/40">
              AD
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Title + Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Wine Token Inventory</h1>
              <p className="text-slate-400">Manage DUAL Network wine provenance tokens</p>
            </div>
            <Link
              href="/admin/mint"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Mint Token
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Tokens</div>
              <div className="text-3xl font-bold text-white">{wines.length}</div>
              <div className="text-xs text-slate-500 mt-2">All inventory</div>
            </div>
            <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/30">
              <div className="text-xs text-emerald-300 uppercase tracking-wider font-bold mb-1">Anchored</div>
              <div className="text-3xl font-bold text-emerald-400">{anchoredCount}</div>
              <div className="text-xs text-emerald-400/70 mt-2">Verified on chain</div>
            </div>
            <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/30">
              <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">Minted</div>
              <div className="text-3xl font-bold text-blue-400">{mintedCount}</div>
              <div className="text-xs text-blue-400/70 mt-2">Ready to anchor</div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Value</div>
              <div className="text-3xl font-bold text-slate-200">
                ${wines.reduce((sum: number, w: any) => sum + (w.wineData.currentValue || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-2">USD value</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
            <input
              type="text"
              placeholder="Search tokens by name or ID..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="minted">Minted</option>
            <option value="anchored">Anchored</option>
            <option value="listed">Listed</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading inventory...</div>
        ) : (
          <div className="bg-slate-800/30 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Token</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vintage</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Units</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Value</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hash</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Links</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((wine: any) => (
                  <tr
                    key={wine.id}
                    className={`border-b border-slate-700 hover:bg-slate-700/50 transition ${
                      wine.status === 'anchored' ? anchoredStatusBg.anchored : 'bg-slate-800/20'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {wine.wineData.imageUrl && (
                          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={wine.wineData.imageUrl}
                              alt={wine.wineData.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-sm text-white">{wine.wineData.name}</div>
                          <div className="text-xs text-slate-400">{wine.wineData.producer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-slate-300">{wine.wineData.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{wine.wineData.vintage}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{wine.wineData.quantity}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-400">${wine.wineData.currentValue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[wine.status] ?? "bg-slate-700 text-slate-300"}`}>
                        {wine.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {wine.contentHash ? (
                        <code className="text-[10px] font-mono text-emerald-300 bg-slate-900/50 px-2 py-1 rounded border border-slate-700">
                          {truncateHash(wine.contentHash, 12)}
                        </code>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {wine.explorerLinks && (wine.explorerLinks.owner || wine.explorerLinks.contentHash || wine.explorerLinks.integrityHash) ? (
                        <div className="flex items-center gap-2">
                          {wine.explorerLinks.owner && (
                            <a
                              href={wine.explorerLinks.owner}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition"
                              title="View Owner on DUAL"
                            >
                              <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
                            </a>
                          )}
                          {wine.explorerLinks.contentHash && (
                            <a
                              href={wine.explorerLinks.contentHash}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition"
                              title="View Content Hash on DUAL"
                            >
                              <span className="material-symbols-outlined text-blue-400 text-sm">description</span>
                            </a>
                          )}
                          {wine.explorerLinks.integrityHash && (
                            <a
                              href={wine.explorerLinks.integrityHash}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition"
                              title="View Integrity Hash on DUAL"
                            >
                              <span className="material-symbols-outlined text-purple-400 text-sm">shield</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/wallet/browse/${wine.id}`}
                        className="text-emerald-400/60 hover:text-emerald-400 transition"
                      >
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No tokens match your criteria</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
