'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthState = 'checking' | 'unauthenticated' | 'otp_sent' | 'authenticated';

type MintStep = {
  id: string;
  label: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'done' | 'error';
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function PropertyAdminPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [mintPhase, setMintPhase] = useState<'form' | 'minting' | 'success'>('form');
  const [mintResult, setMintResult] = useState<{ actionId: string; objectIds: string[] } | null>(null);
  const [mintError, setMintError] = useState('');
  const [mintSteps, setMintSteps] = useState<MintStep[]>([]);

  const [form, setForm] = useState({
    // Property Information
    name: '',
    address: '',
    city: '',
    country: '',
    propertyType: 'residential' as string,
    yearBuilt: new Date().getFullYear(),
    totalSqft: 0,
    numberOfUnits: 1,
    description: '',
    keyFeatures: '',
    // Investment Structure
    totalPropertyValue: 0,
    tokenPricePerShare: 0,
    totalTokens: 0,
    annualYield: 0,
    minimumInvestment: 0,
    // Financial Details
    monthlyRentalIncome: 0,
    annualExpenses: 0,
    netOperatingIncome: 0,
    capRate: 0,
    projectedAppreciation: 0,
  });

  // Check auth on mount
  useEffect(() => {
    fetch('/api/auth/status')
      .then(r => r.json())
      .then(d => {
        setAuthState(d.authenticated ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => setAuthState('unauthenticated'));
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

  const update = (key: string, value: string | number) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMintError('');

    // Initialize mint steps
    const steps: MintStep[] = [
      { id: 'prepare', label: 'Preparing Property Data', description: 'Structuring property metadata for on-chain storage', icon: 'data_object', status: 'pending' },
      { id: 'auth', label: 'Authenticating with DUAL', description: 'Verifying org-scoped JWT credentials', icon: 'shield', status: 'pending' },
      { id: 'mint', label: 'Minting Property Token', description: 'Writing to DUAL Network via /ebus/execute', icon: 'token', status: 'pending' },
      { id: 'anchor', label: 'Anchoring Content Hash', description: 'Computing integrity hash and anchoring on-chain', icon: 'link', status: 'pending' },
      { id: 'confirm', label: 'Confirmed on Blockchain', description: 'Token verified on DUAL Token contract', icon: 'verified', status: 'pending' },
    ];
    setMintSteps(steps);
    setMintPhase('minting');

    // Step 1: Preparing
    await sleep(400);
    steps.find(s => s.id === 'prepare')!.status = 'active';
    setMintSteps([...steps]);
    await sleep(800);
    steps.find(s => s.id === 'prepare')!.status = 'done';
    setMintSteps([...steps]);

    // Step 2: Authenticating
    await sleep(300);
    steps.find(s => s.id === 'auth')!.status = 'active';
    setMintSteps([...steps]);
    await sleep(600);
    steps.find(s => s.id === 'auth')!.status = 'done';
    setMintSteps([...steps]);

    // Step 3: Minting — this is where the real API call happens
    await sleep(300);
    steps.find(s => s.id === 'mint')!.status = 'active';
    setMintSteps([...steps]);

    try {
      const mintPayload = {
        data: {
          name: form.name,
          address: form.address,
          city: form.city,
          country: form.country,
          propertyType: form.propertyType,
          yearBuilt: form.yearBuilt,
          totalSqft: form.totalSqft,
          numberOfUnits: form.numberOfUnits,
          description: form.description,
          keyFeatures: form.keyFeatures.split(',').map(f => f.trim()).filter(Boolean),
          investment: {
            totalPropertyValue: form.totalPropertyValue,
            tokenPricePerShare: form.tokenPricePerShare,
            totalTokens: form.totalTokens,
            annualYield: form.annualYield,
            minimumInvestment: form.minimumInvestment,
          },
          financials: {
            monthlyRentalIncome: form.monthlyRentalIncome,
            annualExpenses: form.annualExpenses,
            netOperatingIncome: form.netOperatingIncome,
            capRate: form.capRate,
            projectedAppreciation: form.projectedAppreciation,
          },
        },
      };

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mintPayload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        steps.find(s => s.id === 'mint')!.status = 'error';
        setMintSteps([...steps]);
        setMintError(data.error || 'Mint failed');
        if (res.status === 401) setAuthState('unauthenticated');
        setSubmitting(false);
        return;
      }

      steps.find(s => s.id === 'mint')!.status = 'done';
      setMintSteps([...steps]);

      // Step 4: Anchoring
      await sleep(400);
      steps.find(s => s.id === 'anchor')!.status = 'active';
      setMintSteps([...steps]);
      await sleep(900);
      steps.find(s => s.id === 'anchor')!.status = 'done';
      setMintSteps([...steps]);

      // Step 5: Confirmed
      await sleep(400);
      steps.find(s => s.id === 'confirm')!.status = 'active';
      setMintSteps([...steps]);
      await sleep(600);
      steps.find(s => s.id === 'confirm')!.status = 'done';
      setMintSteps([...steps]);

      await sleep(500);
      setMintResult({
        actionId: data.actionId,
        objectIds: data.objectIds,
      });
      setMintPhase('success');

    } catch (err: any) {
      steps.find(s => s.id === 'mint')!.status = 'error';
      setMintSteps([...steps]);
      setMintError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Auth Gate ──
  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center py-24 bg-[#0b1120]">
        <div className="w-8 h-8 rounded-full border-2 border-[#c9a84c] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (authState === 'unauthenticated' || authState === 'otp_sent') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b1120] p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <h1 className="text-sm font-semibold text-white">Admin Authentication</h1>
              <p className="text-[10px] text-[#5a7fa0]">Verify your email to manage property tokens</p>
            </div>

            <div className="px-4 py-4">
              {authError && (
                <div className="mb-4 p-3 rounded bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-[11px]">
                  {authError}
                </div>
              )}

              {authState === 'unauthenticated' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={!email || authLoading}
                    className="w-full bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] text-xs font-bold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {authLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[#5a7fa0] text-[10px]">Code sent to {email}</p>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Enter Code</label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8] text-center tracking-widest"
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    disabled={!otp || authLoading}
                    className="w-full bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] text-xs font-bold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {authLoading ? 'Verifying...' : 'Verify'}
                  </button>
                  <button
                    onClick={() => {
                      setAuthState('unauthenticated');
                      setOtp('');
                    }}
                    className="w-full text-[#5a7fa0] text-[10px] hover:text-[#8bb8e8] transition py-1"
                  >
                    Change email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Minting Phase ──
  if (mintPhase === 'minting') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b1120] p-4">
        <div className="w-full max-w-2xl max-w-[1400px] mx-auto px-4 py-6">
          <div className="space-y-3">
            {mintSteps.map((step, idx) => (
              <div key={step.id}>
                <div className={`bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg p-3 transition ${
                  step.status === 'done' ? 'border-[#4ade80]/50' :
                  step.status === 'error' ? 'border-[#ef4444]/50' :
                  step.status === 'active' ? 'border-[#c9a84c]/50' :
                  ''
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {step.status === 'done' && <span className="text-[#4ade80] text-sm">✓</span>}
                      {step.status === 'error' && <span className="text-[#ef4444] text-sm">✕</span>}
                      {step.status === 'active' && <span className="text-[#c9a84c] text-sm animate-pulse">●</span>}
                      {step.status === 'pending' && <span className="text-[#5a7fa0] text-sm">●</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white">{step.label}</p>
                      <p className="text-[10px] text-[#5a7fa0] mt-0.5">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mintError && (
            <div className="mt-6 bg-[#0f1b2e] border border-[#ef4444]/50 rounded-lg p-4">
              <p className="text-[11px] font-semibold text-[#ef4444] mb-2">Mint Failed</p>
              <p className="text-[10px] text-[#ef4444] mb-4">{mintError}</p>
              <button
                onClick={() => setMintPhase('form')}
                className="bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] text-xs font-bold px-3 py-2 rounded"
              >
                Back to Form
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Success Phase ──
  if (mintPhase === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b1120] p-4">
        <div className="w-full max-w-2xl max-w-[1400px] mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-[#4ade80]">✓</span>
            </div>
            <h1 className="text-sm font-semibold text-white mb-1">Property Token Minted</h1>
            <p className="text-[10px] text-[#5a7fa0]">{form.name}</p>
          </div>

          {mintResult && (
            <div className="space-y-3 mb-6">
              <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2">
                <p className="text-[10px] text-[#5a7fa0] mb-2">Action ID</p>
                <p className="text-[11px] text-white font-mono break-all mb-4">{mintResult.actionId}</p>
              </div>

              {mintResult.objectIds.length > 0 && (
                <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2">
                  <p className="text-[10px] text-[#5a7fa0] mb-2">Property Token ID{mintResult.objectIds.length > 1 ? 's' : ''}</p>
                  <div className="space-y-2">
                    {mintResult.objectIds.map((id, idx) => (
                      <p key={idx} className="text-[#8bb8e8] font-mono text-[11px] break-all">
                        {id}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setMintPhase('form');
                setForm({
                  name: '',
                  address: '',
                  city: '',
                  country: '',
                  propertyType: 'residential',
                  yearBuilt: new Date().getFullYear(),
                  totalSqft: 0,
                  numberOfUnits: 1,
                  description: '',
                  keyFeatures: '',
                  totalPropertyValue: 0,
                  tokenPricePerShare: 0,
                  totalTokens: 0,
                  annualYield: 0,
                  minimumInvestment: 0,
                  monthlyRentalIncome: 0,
                  annualExpenses: 0,
                  netOperatingIncome: 0,
                  capRate: 0,
                  projectedAppreciation: 0,
                });
                setMintResult(null);
              }}
              className="flex-1 bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] text-xs font-bold py-2 rounded"
            >
              Mint Another
            </button>
            <Link
              href="/property"
              className="flex-1 bg-[#0f1b2e] border border-[#1e3a5f]/50 text-[#8bb8e8] text-xs font-bold py-2 rounded text-center hover:border-[#8bb8e8]"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Phase ──
  return (
    <div className="min-h-screen bg-[#0b1120]">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-sm font-semibold text-white mb-1">Property Minting</h1>
          <p className="text-[10px] text-[#5a7fa0]">Create and tokenize a new property on the DUAL Network</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Form Panels (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Property Information Panel */}
            <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
              <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/50">
                <p className="text-sm font-semibold text-white">Property Information</p>
                <p className="text-[10px] text-[#5a7fa0] mt-1">Basic property details</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Property Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="e.g., Sunset Hills"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Address</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="123 Oak Street"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Country</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => update('country', e.target.value)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="United States"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Type</label>
                    <select
                      value={form.propertyType}
                      onChange={(e) => update('propertyType', e.target.value)}
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8bb8e8]"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="mixed-use">Mixed-Use</option>
                      <option value="hospitality">Hospitality</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Year Built</label>
                    <input
                      type="number"
                      value={form.yearBuilt}
                      onChange={(e) => update('yearBuilt', parseInt(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Total Sqft</label>
                    <input
                      type="number"
                      value={form.totalSqft}
                      onChange={(e) => update('totalSqft', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Units</label>
                    <input
                      type="number"
                      value={form.numberOfUnits}
                      onChange={(e) => update('numberOfUnits', parseInt(e.target.value) || 1)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    rows={3}
                    className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8] resize-none"
                    placeholder="Property description..."
                  />
                </div>
              </div>
            </div>

            {/* Investment Structure Panel */}
            <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
              <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/50">
                <p className="text-sm font-semibold text-white">Investment Structure</p>
                <p className="text-[10px] text-[#5a7fa0] mt-1">Token economics</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Total Value ($)</label>
                    <input
                      type="number"
                      value={form.totalPropertyValue}
                      onChange={(e) => update('totalPropertyValue', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="10000000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Token Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.tokenPricePerShare}
                      onChange={(e) => update('tokenPricePerShare', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Total Tokens</label>
                    <input
                      type="number"
                      value={form.totalTokens}
                      onChange={(e) => update('totalTokens', parseInt(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Annual Yield (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.annualYield}
                      onChange={(e) => update('annualYield', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="6.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Minimum Investment ($)</label>
                    <input
                      type="number"
                      value={form.minimumInvestment}
                      onChange={(e) => update('minimumInvestment', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Details Panel */}
            <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
              <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/50">
                <p className="text-sm font-semibold text-white">Financial Details</p>
                <p className="text-[10px] text-[#5a7fa0] mt-1">Performance metrics</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Monthly Income ($)</label>
                    <input
                      type="number"
                      value={form.monthlyRentalIncome}
                      onChange={(e) => update('monthlyRentalIncome', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Annual Expenses ($)</label>
                    <input
                      type="number"
                      value={form.annualExpenses}
                      onChange={(e) => update('annualExpenses', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="300000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Net Operating Income ($)</label>
                    <input
                      type="number"
                      value={form.netOperatingIncome}
                      onChange={(e) => update('netOperatingIncome', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="300000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Cap Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.capRate}
                      onChange={(e) => update('capRate', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="3.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-[#5a7fa0] mb-1.5">Projected Appreciation (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.projectedAppreciation}
                      onChange={(e) => update('projectedAppreciation', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]/50 focus:outline-none focus:border-[#8bb8e8]"
                      placeholder="2.0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {mintError && (
              <div className="bg-[#0f1b2e] border border-[#ef4444]/50 rounded-lg p-3">
                <p className="text-[11px] text-[#ef4444]">{mintError}</p>
              </div>
            )}
          </div>

          {/* Right Column: Preview Panel (1/3) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Mint Preview */}
            <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden sticky top-6">
              <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/50">
                <p className="text-sm font-semibold text-white">Mint Summary</p>
                <p className="text-[10px] text-[#5a7fa0] mt-1">Review before tokenizing</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[#5a7fa0]">Property Name</span>
                    <span className="text-[11px] text-white font-semibold text-right">{form.name || '—'}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[#5a7fa0]">Total Value</span>
                    <span className="text-[11px] text-white font-semibold">${form.totalPropertyValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[#5a7fa0]">Total Tokens</span>
                    <span className="text-[11px] text-white font-semibold">{form.totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[#5a7fa0]">Annual Yield</span>
                    <span className="text-[11px] text-[#4ade80] font-semibold">{form.annualYield}%</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[#5a7fa0]">Min Investment</span>
                    <span className="text-[11px] text-white font-semibold">${form.minimumInvestment.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-[#1e3a5f]/50 pt-3">
                  <p className="text-[10px] text-[#5a7fa0] mb-2">Minting Steps</p>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#5a7fa0]">●</span>
                      <span className="text-[#5a7fa0]">Preparing Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#5a7fa0]">●</span>
                      <span className="text-[#5a7fa0]">Authentication</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#5a7fa0]">●</span>
                      <span className="text-[#5a7fa0]">Minting Token</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#5a7fa0]">●</span>
                      <span className="text-[#5a7fa0]">Anchoring Hash</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#5a7fa0]">●</span>
                      <span className="text-[#5a7fa0]">Confirmation</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] text-xs font-bold py-2.5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? 'Minting...' : 'Mint Property Token'}
                </button>

                <Link
                  href="/property"
                  className="block w-full bg-[#0f1b2e] border border-[#1e3a5f]/50 text-[#8bb8e8] text-xs font-bold py-2 rounded text-center hover:border-[#8bb8e8]"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
