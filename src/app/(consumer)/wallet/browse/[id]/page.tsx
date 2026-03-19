'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Wine, Action } from "@/types/dual";

function truncateHash(hash: string, length: number = 16): string {
  if (!hash) return '';
  return hash.length > length ? `${hash.slice(0, length)}...` : hash;
}

function CopyButton({ text, label }: { text: string; label: string }): any {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 hover:border-emerald-400/50 hover:bg-slate-800 transition text-xs text-emerald-300 font-mono group"
    >
      <span className="text-slate-400 group-hover:text-emerald-400 transition">{label}</span>
      <span className="material-symbols-outlined text-xs">{copied ? 'check' : 'content_copy'}</span>
    </button>
  );
}

export default function WineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [wine, setWine] = useState<Wine | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"details" | "blockchain" | "tasting">("details");

  useEffect(() => {
    if (!params.id) return;
    // Fetch wine data — don't let actions failure block the page
    fetch(`/api/wines/${params.id}`)
      .then((r: any) => r.json())
      .then((wineData: any) => {
        if (wineData && !wineData.error) setWine(wineData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // Fetch actions separately — non-blocking
    fetch("/api/actions")
      .then((r: any) => { if (r.ok) return r.json(); return []; })
      .then((allActions: any) => {
        if (Array.isArray(allActions)) {
          setActions(allActions.filter((a: Action) => a.wineId === params.id));
        }
      })
      .catch(() => {});
  }, [params.id]);

  if (loading)
    return (
      <div className="text-center py-12 text-slate-400 text-sm">Loading...</div>
    );
  if (!wine)
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        Token not found
      </div>
    );

  const d = wine.wineData;

  return (
    <div className="relative pb-28 bg-slate-900 min-h-screen">
      {/* Hero Section with Token Image */}
      <div className="relative h-[50vh] bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center hover:bg-slate-900/80 transition border border-slate-700"
        >
          <span className="material-symbols-outlined text-slate-200">
            arrow_back
          </span>
        </button>

        {/* Status badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {wine.status === 'anchored' && (
            <div className="flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-400/50">
              <span className="material-symbols-outlined text-emerald-300 text-sm animate-pulse">
                verified
              </span>
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
                Anchored
              </span>
            </div>
          )}
          {wine.objectId && (
            <div className="bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700 font-mono text-xs text-slate-300">
              #{truncateHash(wine.objectId, 8)}
            </div>
          )}
        </div>

        {/* Wine Image/Icon */}
        <div className="flex items-center justify-center">
          {d.imageUrl ? (
            <img
              src={d.imageUrl}
              alt={d.name}
              className="h-40 w-auto object-contain drop-shadow-2xl"
            />
          ) : (
            <span className="material-symbols-outlined text-emerald-300/20 text-[140px]">
              wine_bar
            </span>
          )}
        </div>
      </div>

      {/* Pull-up Card */}
      <div className="relative -mt-12 bg-slate-900 rounded-t-3xl px-4 pt-6 max-w-md mx-auto border-t border-slate-700 shadow-2xl">
        {/* Wine Name & Producer */}
        <h1 className="text-2xl font-bold text-white mb-1">{d.name}</h1>
        <p className="text-sm text-slate-400 mb-5">
          {d.producer} · {d.region} · {d.vintage}
        </p>

        {/* Premium Status Section */}
        {wine.status === 'anchored' && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-2xl p-4 mb-6 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
              <span className="text-sm font-bold text-emerald-300">Verified on Blockchain</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This wine provenance token is cryptographically verified and anchored on the DUAL Network
            </p>
          </div>
        )}

        {/* Value Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-850 rounded-2xl p-4 border border-slate-700 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">
              Current Value
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              ${d.currentValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">per unit</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-850 rounded-2xl p-4 border border-slate-700 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">
              Vintage
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {d.vintage}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">year</div>
          </div>
        </div>

        {/* Token Information */}
        {wine.objectId && (
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 mb-6">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Token Identity
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Object ID</span>
                <code className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                  {truncateHash(wine.objectId, 24)}
                </code>
              </div>
              {wine.contentHash && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">Content Hash</span>
                  <code className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                    {truncateHash(wine.contentHash, 16)}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-700 mb-4">
          {[
            { key: "details" as const, label: "Details" },
            { key: "blockchain" as const, label: "Verification" },
            { key: "tasting" as const, label: "Tasting" },
          ].map((t: any) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
                tab === t.key
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "details" && (
          <div className="space-y-4 pb-4">
            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Wine Information
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  ["Varietal", d.varietal],
                  ["Type", d.type.charAt(0).toUpperCase() + d.type.slice(1)],
                  ["ABV", `${d.abv}%`],
                  ["Volume", d.volume],
                  ["Quantity", `${d.quantity} unit${d.quantity !== 1 ? 's' : ''}`],
                ].map((item: any) => (
                  <div key={item[0]} className="flex justify-between">
                    <span className="text-slate-500">{item[0]}</span>
                    <span className="font-medium text-slate-200">{item[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Storage & Condition
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  ["Condition", d.condition.replace("_", " ")],
                  ["Storage", d.storage.replace("_", " ")],
                  [
                    "Drinking Window",
                    `${d.drinkingWindow.from}–${d.drinkingWindow.to}`,
                  ],
                ].map((item: any) => (
                  <div key={item[0]} className="flex justify-between">
                    <span className="text-slate-500">{item[0]}</span>
                    <span className="font-medium text-slate-200 capitalize">
                      {item[1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {d.description && (
              <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  About
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {d.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Blockchain Verification Tab */}
        {tab === "blockchain" && (
          <div className="space-y-4 pb-4">
            <div className="bg-gradient-to-b from-emerald-500/10 to-emerald-600/5 rounded-2xl p-4 border border-emerald-500/30">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">verified</span>
                Blockchain Verification
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                All token data is cryptographically verified on the DUAL Network and indexed on DUAL
              </p>
            </div>

            {wine.objectId && (
              <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Object ID
                </h4>
                <div className="space-y-2">
                  <code className="block bg-slate-900 px-3 py-2 rounded text-[10px] font-mono text-emerald-300 break-all">
                    {wine.objectId}
                  </code>
                  {wine.objectId && <CopyButton text={wine.objectId} label="Copy ID" />}
                </div>
              </div>
            )}

            {wine.contentHash && (
              <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Content Hash
                </h4>
                <div className="space-y-2">
                  <code className="block bg-slate-900 px-3 py-2 rounded text-[10px] font-mono text-emerald-300 break-all">
                    {wine.contentHash}
                  </code>
                  <div className="flex gap-2">
                    {wine.contentHash && <CopyButton text={wine.contentHash} label="Copy Hash" />}
                    {wine.explorerLinks?.contentHash && (
                      <a
                        href={wine.explorerLinks.contentHash}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400/50 hover:bg-emerald-500/20 transition text-xs text-emerald-300 font-semibold"
                      >
                        <span>Verify on DUAL</span>
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {wine.blockchainTxHash && (
              <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Integrity Hash
                </h4>
                <div className="space-y-2">
                  <code className="block bg-slate-900 px-3 py-2 rounded text-[10px] font-mono text-emerald-300 break-all">
                    {wine.blockchainTxHash}
                  </code>
                  <div className="flex gap-2">
                    {wine.blockchainTxHash && <CopyButton text={wine.blockchainTxHash} label="Copy Hash" />}
                    {wine.explorerLinks?.integrityHash && (
                      <a
                        href={wine.explorerLinks.integrityHash}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400/50 hover:bg-emerald-500/20 transition text-xs text-emerald-300 font-semibold"
                      >
                        <span>View on DUAL</span>
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {wine.ownerId && (
              <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Owner Address
                </h4>
                <div className="space-y-2">
                  <code className="block bg-slate-900 px-3 py-2 rounded text-[10px] font-mono text-slate-400 break-all">
                    {wine.ownerId}
                  </code>
                  {wine.explorerLinks?.owner && (
                    <a
                      href={wine.explorerLinks.owner}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition text-xs text-slate-300 font-semibold"
                    >
                      <span>View Owner</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Token Timeline
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="text-slate-300">{new Date(wine.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="text-slate-300">{new Date(wine.updatedAt).toLocaleDateString()}</span>
                </div>
                {wine.status === 'anchored' && (
                  <div className="flex justify-between pt-2 border-t border-slate-700">
                    <span className="text-emerald-400">Status</span>
                    <span className="text-emerald-300 font-semibold">ANCHORED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "tasting" && (
          <div className="space-y-4 pb-4">
            {[
              {
                label: "Nose",
                icon: "air",
                value: d.tastingNotes?.nose || "Not available",
              },
              {
                label: "Palate",
                icon: "restaurant",
                value: d.tastingNotes?.palate || "Not available",
              },
              {
                label: "Finish",
                icon: "timer",
                value: d.tastingNotes?.finish || "Not available",
              },
            ].map((note: any) => (
              <div
                key={note.label}
                className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-emerald-400 text-lg">
                    {note.icon}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200">
                    {note.label}
                  </h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {note.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
