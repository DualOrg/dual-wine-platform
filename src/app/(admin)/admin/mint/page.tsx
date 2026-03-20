'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthState = 'checking' | 'unauthenticated' | 'otp_sent' | 'authenticated';

export default function MintWinePage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mintResult, setMintResult] = useState<{ actionId: string; objectIds: string[] } | null>(null);
  const [mintError, setMintError] = useState('');
  const [form, setForm] = useState({
    name: "", producer: "", region: "", country: "", vintage: new Date().getFullYear(),
    varietal: "", type: "red" as string, abv: 13.5, volume: "750ml", quantity: 1,
    condition: "pristine" as string, storage: "professional" as string,
    drinkingFrom: new Date().getFullYear(), drinkingTo: new Date().getFullYear() + 10,
    currentValue: 0, purchasePrice: 0, description: "",
    nose: "", palate: "", finish: "",
  });

  // Check auth status on mount
  useEffect(() => {
    fetch('/api/auth/status').then(r => r.json()).then(d => {
      setAuthState(d.authenticated ? 'authenticated' : 'unauthenticated');
    }).catch(() => setAuthState('unauthenticated'));
  }, []);

  const handleSendOtp = async () => {
    if (!email) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthState('otp_sent');
      } else {
        setAuthError(data.error || 'Failed to send OTP');
      }
    } catch {
      setAuthError('Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!otp) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthState('authenticated');
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch {
      setAuthError('Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const update = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMintError('');
    try {
      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            name: form.name, producer: form.producer, region: form.region, country: form.country,
            vintage: form.vintage, varietal: form.varietal, type: form.type, abv: form.abv,
            volume: form.volume, quantity: form.quantity, condition: form.condition, storage: form.storage,
            drinkingWindow: { from: form.drinkingFrom, to: form.drinkingTo },
            ratings: [], certifications: [],
            currentValue: form.currentValue, purchasePrice: form.purchasePrice,
            description: form.description,
            tastingNotes: { nose: form.nose, palate: form.palate, finish: form.finish },
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setMintResult({ actionId: data.actionId, objectIds: data.objectIds });
      } else {
        setMintError(data.error || 'Mint failed');
        if (res.status === 401) setAuthState('unauthenticated');
      }
    } catch (err: any) {
      setMintError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Auth Gate ──
  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-wine-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (authState === 'unauthenticated' || authState === 'otp_sent') {
    return (
      <div>
        <header className="h-20 flex items-center justify-between px-8 bg-surface border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Admin</span>
            <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
            <span className="text-primary font-semibold">Authenticate</span>
          </div>
        </header>
        <div className="p-8 max-w-md mx-auto">
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="w-16 h-16 rounded-full bg-wine-50 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-wine-700 text-3xl">lock</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">DUAL Network Auth</h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              {authState === 'unauthenticated'
                ? 'Enter your email to receive a one-time code for minting tokens.'
                : `Enter the OTP code sent to ${email}`}
            </p>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {authError}
              </div>
            )}

            {authState === 'unauthenticated' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white"
                    placeholder="admin@example.com"
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={authLoading || !email}
                  className="w-full py-3 rounded-xl wine-gradient text-white font-bold text-sm shadow-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">mail</span>
                  )}
                  {authLoading ? 'Sending...' : 'Send OTP Code'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white text-center tracking-[0.3em] font-mono text-lg"
                    placeholder="Enter code"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={authLoading || !otp}
                  className="w-full py-3 rounded-xl gold-gradient text-white font-bold text-sm shadow-lg shadow-accent/20 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">login</span>
                  )}
                  {authLoading ? 'Authenticating...' : 'Verify & Login'}
                </button>
                <button
                  onClick={() => { setAuthState('unauthenticated'); setOtp(''); setAuthError(''); }}
                  className="w-full py-2 text-slate-500 text-sm hover:text-slate-700 transition"
                >
                  Back to email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Mint Success ──
  if (success && mintResult) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Wine Token Minted!</h2>
        <p className="text-slate-500 text-sm mb-4">Token created on the DUAL network</p>

        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs font-mono max-w-sm w-full">
          <div className="flex justify-between">
            <span className="text-slate-400">Action ID</span>
            <span className="text-slate-700 truncate ml-4">{mintResult.actionId}</span>
          </div>
          {mintResult.objectIds.map((id: string, i: number) => (
            <div key={i} className="flex justify-between">
              <span className="text-slate-400">Object {i + 1}</span>
              <span className="text-slate-700 truncate ml-4">{id}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.push("/admin/inventory")}
            className="px-6 py-2.5 rounded-xl wine-gradient text-white font-bold text-sm"
          >
            View Inventory
          </button>
          <button
            onClick={() => { setSuccess(false); setMintResult(null); setForm({ ...form, name: '' }); }}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
          >
            Mint Another
          </button>
        </div>
      </div>
    );
  }

  // ── Mint Form ──
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-white";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <div>
      <header className="h-20 flex items-center justify-between px-8 bg-surface border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Admin</span>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-primary font-semibold">Mint Wine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Authenticated
          </span>
        </div>
      </header>

      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Mint New Wine Token</h1>
          <p className="text-sm text-slate-500">Create a new tokenised wine on the DUAL network</p>
        </div>

        {mintError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm max-w-4xl">
            {mintError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {/* Wine Information */}
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">wine_bar</span>
              Wine Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className={labelClass}>Wine Name *</label><input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="e.g. Penfolds Grange 2018" /></div>
              <div><label className={labelClass}>Producer *</label><input required value={form.producer} onChange={(e) => update("producer", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Varietal *</label><input required value={form.varietal} onChange={(e) => update("varietal", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Region *</label><input required value={form.region} onChange={(e) => update("region", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Country *</label><input required value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Vintage *</label><input type="number" required value={form.vintage} onChange={(e) => update("vintage", parseInt(e.target.value))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Type *</label>
                <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
                  {["red", "white", "sparkling", "rosé", "dessert", "fortified"].map((t: any) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div><label className={labelClass}>ABV (%)</label><input type="number" step="0.1" value={form.abv} onChange={(e) => update("abv", parseFloat(e.target.value))} className={inputClass} /></div>
              <div><label className={labelClass}>Volume</label><input value={form.volume} onChange={(e) => update("volume", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Quantity</label><input type="number" min="1" value={form.quantity} onChange={(e) => update("quantity", parseInt(e.target.value))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Condition</label>
                <select value={form.condition} onChange={(e) => update("condition", e.target.value)} className={inputClass}>
                  {["pristine", "excellent", "very_good", "good", "fair", "poor"].map((c: any) => (
                    <option key={c} value={c}>{c.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2"><label className={labelClass}>Description</label><textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className={inputClass} /></div>
            </div>
          </div>

          {/* Valuation & Storage */}
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-lg">payments</span>
              Valuation & Storage
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Purchase Price ($)</label><input type="number" value={form.purchasePrice} onChange={(e) => update("purchasePrice", parseFloat(e.target.value))} className={inputClass} /></div>
              <div><label className={labelClass}>Current Value ($)</label><input type="number" value={form.currentValue} onChange={(e) => update("currentValue", parseFloat(e.target.value))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Storage Type</label>
                <select value={form.storage} onChange={(e) => update("storage", e.target.value)} className={inputClass}>
                  {["professional", "home_cellar", "bonded_warehouse", "in_transit"].map((s: any) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Drink From</label><input type="number" value={form.drinkingFrom} onChange={(e) => update("drinkingFrom", parseInt(e.target.value))} className={inputClass} /></div>
                <div><label className={labelClass}>Drink To</label><input type="number" value={form.drinkingTo} onChange={(e) => update("drinkingTo", parseInt(e.target.value))} className={inputClass} /></div>
              </div>
            </div>
          </div>

          {/* Tasting Notes */}
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">restaurant</span>
              Tasting Notes
            </h3>
            <div className="space-y-4">
              <div><label className={labelClass}>Nose</label><input value={form.nose} onChange={(e) => update("nose", e.target.value)} className={inputClass} placeholder="Aromas and scents..." /></div>
              <div><label className={labelClass}>Palate</label><input value={form.palate} onChange={(e) => update("palate", e.target.value)} className={inputClass} placeholder="Taste and texture..." /></div>
              <div><label className={labelClass}>Finish</label><input value={form.finish} onChange={(e) => update("finish", e.target.value)} className={inputClass} placeholder="Aftertaste and length..." /></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl gold-gradient text-white font-bold text-sm shadow-lg shadow-accent/20 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span className="material-symbols-outlined">database</span>
            )}
            {submitting ? "Minting on DUAL..." : "Mint Wine Token"}
          </button>
        </form>
      </div>
    </div>
  );
}
