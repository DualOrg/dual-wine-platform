'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TokenHolder {
  address: string;
  sharesOwned: number;
  percentOwnership: number;
  payoutAmount: number;
}

interface Property {
  id: string;
  name: string;
  type: string;
}

interface Distribution {
  id: string;
  date: string;
  property: string;
  totalAmount: number;
  holdersCount: number;
  txHash: string;
}

const mockProperties: Property[] = [
  { id: 'elysian-tower', name: 'The Elysian Tower', type: 'Residential' },
  { id: 'harbour-view', name: 'Harbour View Residences', type: 'Residential' },
  { id: 'boulevard-commerce', name: 'Boulevard Commerce Hub', type: 'Commercial' },
  { id: 'emirates-tower', name: 'Emirates Crown Tower', type: 'Mixed-Use' },
  { id: 'ocean-residences', name: 'Ocean Residences Miami', type: 'Residential' },
];

const generateMockHolders = (): TokenHolder[] => [
  {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42cCA',
    sharesOwned: 8450,
    percentOwnership: 0.42,
    payoutAmount: 3200,
  },
  {
    address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    sharesOwned: 6200,
    percentOwnership: 0.31,
    payoutAmount: 2340,
  },
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sharesOwned: 4100,
    percentOwnership: 0.205,
    payoutAmount: 1550,
  },
  {
    address: '0x70997970C51812e339D9B73b0245ad59E9edd4FA',
    sharesOwned: 3200,
    percentOwnership: 0.16,
    payoutAmount: 1215,
  },
  {
    address: '0x3C44CdDdB6a900c6671B362144b7bEcE02A66a73',
    sharesOwned: 2100,
    percentOwnership: 0.105,
    payoutAmount: 797,
  },
];

const mockDistributionHistory: Distribution[] = [
  {
    id: 'dist_001',
    date: '2026-02-15',
    property: 'The Elysian Tower',
    totalAmount: 45000,
    holdersCount: 5,
    txHash: '0xabc123def456789ghi012jkl345mno',
  },
  {
    id: 'dist_002',
    date: '2026-01-15',
    property: 'Boulevard Commerce Hub',
    totalAmount: 38500,
    holdersCount: 6,
    txHash: '0xdef789ghi012jkl345mno678pqr901',
  },
  {
    id: 'dist_003',
    date: '2025-12-15',
    property: 'Emirates Crown Tower',
    totalAmount: 52300,
    holdersCount: 7,
    txHash: '0xghi345mno678pqr901stu234vwx567',
  },
];

export default function DistributePage() {
  const [selectedProperty, setSelectedProperty] = useState<string>(mockProperties[0].id);
  const [distributionAmount, setDistributionAmount] = useState<string>('50000');
  const [distributionPeriod, setDistributionPeriod] = useState<string>('monthly');
  const [holders, setHolders] = useState<TokenHolder[]>(generateMockHolders());
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionStage, setDistributionStage] = useState<string>('idle');
  const [completedHolders, setCompletedHolders] = useState<number>(0);

  // Recalculate payouts when amount changes
  useEffect(() => {
    const amount = parseFloat(distributionAmount) || 0;
    const totalShares = holders.reduce((sum, h) => sum + h.sharesOwned, 0);
    const payoutPerShare = totalShares > 0 ? amount / totalShares : 0;

    setHolders((prev) =>
      prev.map((h) => ({
        ...h,
        percentOwnership: (h.sharesOwned / totalShares) * 100,
        payoutAmount: h.sharesOwned * payoutPerShare,
      }))
    );
  }, [distributionAmount]);

  const selectedProp = mockProperties.find((p) => p.id === selectedProperty);
  const totalDistribution = parseFloat(distributionAmount) || 0;
  const totalShares = holders.reduce((sum, h) => sum + h.sharesOwned, 0);
  const payoutPerToken = totalShares > 0 ? totalDistribution / totalShares : 0;

  const handleExecuteDistribution = async () => {
    setIsDistributing(true);
    setDistributionStage('calculating');
    setCompletedHolders(0);

    try {
      // Stage 1: Calculating payouts
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setDistributionStage('executing');

      // Stage 2: Simulating per-holder execution
      for (let i = 0; i < holders.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setCompletedHolders(i + 1);
      }

      // Stage 3: Recording on blockchain
      setDistributionStage('recording');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Call the API
      const response = await fetch('/api/properties/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty,
          amount: totalDistribution,
          period: distributionPeriod,
          holders: holders.map((h) => ({
            address: h.address,
            shares: h.sharesOwned,
            payout: h.payoutAmount,
          })),
        }),
      });

      if (response.ok) {
        setDistributionStage('complete');
      } else {
        throw new Error('Distribution failed');
      }
    } catch (error) {
      alert('Error executing distribution: ' + (error as Error).message);
      setDistributionStage('idle');
    } finally {
      setIsDistributing(false);
    }
  };

  const resetDistribution = () => {
    setDistributionStage('idle');
    setCompletedHolders(0);
  };

  return (
    <div className="bg-[#0b1120] min-h-screen">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="mb-6">
          <Link
            href="/property/portfolio"
            className="text-[#8bb8e8] hover:text-white transition-colors text-xs font-medium"
          >
            ← Back to Portfolio
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Yield Distribution</h1>
          <p className="text-[#5a7fa0] text-xs">Distribute rental income to property token holders</p>
        </div>

        {/* Top Row: 3 Stat Panels */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Total Distributed */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2">
            <div className="text-[10px] text-[#5a7fa0] uppercase font-medium mb-2">Total Distributed</div>
            <div className="text-white font-bold text-lg mb-1">$1,247,500</div>
            <div className="text-[10px] text-[#4ade80]">+5.2% from last month</div>
          </div>

          {/* Pending Distributions */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2">
            <div className="text-[10px] text-[#5a7fa0] uppercase font-medium mb-2">Pending Distributions</div>
            <div className="text-white font-bold text-lg mb-1">$385,000</div>
            <div className="text-[10px] text-[#8bb8e8]">3 properties queued</div>
          </div>

          {/* Next Distribution Date */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2">
            <div className="text-[10px] text-[#5a7fa0] uppercase font-medium mb-2">Next Distribution</div>
            <div className="text-white font-bold text-lg mb-1">March 28, 2026</div>
            <div className="text-[10px] text-[#8bb8e8]">6 days remaining</div>
          </div>
        </div>

        {/* Main Content: Form (2/3) and Preview (1/3) */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Left: Distribution Form */}
          <div className="col-span-2">
            <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg">
              {/* Panel Header */}
              <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
                <div className="text-sm font-semibold text-white">Distribution Form</div>
                <div className="text-[10px] text-[#5a7fa0]">Configure and execute distribution parameters</div>
              </div>

              {/* Panel Content */}
              <div className="p-4 space-y-4">
                {/* Property Selector */}
                <div>
                  <label className="text-[10px] text-[#5a7fa0] font-medium block mb-2">Property</label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    disabled={isDistributing}
                    className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9a84c] disabled:opacity-50"
                  >
                    {mockProperties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.name} ({prop.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Distribution Amount */}
                <div>
                  <label className="text-[10px] text-[#5a7fa0] font-medium block mb-2">Total Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1.5 text-white text-xs">$</span>
                    <input
                      type="number"
                      value={distributionAmount}
                      onChange={(e) => setDistributionAmount(e.target.value)}
                      disabled={isDistributing}
                      placeholder="50000"
                      className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 pl-6 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9a84c] disabled:opacity-50"
                    />
                  </div>
                  <div className="text-[10px] text-[#5a7fa0] mt-1">Per-token payout: ${payoutPerToken.toFixed(4)}</div>
                </div>

                {/* Distribution Period */}
                <div>
                  <label className="text-[10px] text-[#5a7fa0] font-medium block mb-2">Period</label>
                  <select
                    value={distributionPeriod}
                    onChange={(e) => setDistributionPeriod(e.target.value)}
                    disabled={isDistributing}
                    className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9a84c] disabled:opacity-50"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annual">Semi-Annual</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>

                {/* Token Holders Breakdown Table */}
                <div>
                  <div className="text-[10px] text-[#5a7fa0] font-medium block mb-2">Holder Breakdown</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-[#1e3a5f]/20">
                          <th className="text-left py-2 px-2 text-[10px] font-semibold text-[#5a7fa0]">Address</th>
                          <th className="text-right py-2 px-2 text-[10px] font-semibold text-[#5a7fa0]">Shares</th>
                          <th className="text-right py-2 px-2 text-[10px] font-semibold text-[#5a7fa0]">%</th>
                          <th className="text-right py-2 px-2 text-[10px] font-semibold text-[#5a7fa0]">Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holders.map((holder, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10"
                          >
                            <td className="py-1.5 px-2 text-white font-mono">
                              {holder.address.slice(0, 8)}...{holder.address.slice(-6)}
                            </td>
                            <td className="text-right py-1.5 px-2 text-white">
                              {holder.sharesOwned.toLocaleString()}
                            </td>
                            <td className="text-right py-1.5 px-2 text-white">
                              {holder.percentOwnership.toFixed(1)}%
                            </td>
                            <td className="text-right py-1.5 px-2 text-[#4ade80] font-semibold">
                              ${holder.payoutAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-[#1e3a5f]/10 border-t border-[#1e3a5f]/30">
                          <td colSpan={4} className="py-2 px-2">
                            <div className="flex justify-between text-white text-[10px] font-semibold">
                              <span>Total Payout:</span>
                              <span>${totalDistribution.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Execute Button */}
                <button
                  onClick={handleExecuteDistribution}
                  disabled={isDistributing || distributionAmount === ''}
                  className="w-full py-2 bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] font-bold rounded text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-[#c9a84c]/20 transition-all disabled:opacity-50"
                >
                  {isDistributing ? `Processing (${distributionStage})` : 'Execute Distribution'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Distribution Preview */}
          <div className="col-span-1">
            <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg sticky top-4">
              {/* Panel Header */}
              <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
                <div className="text-sm font-semibold text-white">Preview</div>
                <div className="text-[10px] text-[#5a7fa0]">Distribution summary</div>
              </div>

              {/* Panel Content */}
              <div className="p-4">
                {distributionStage === 'complete' ? (
                  <div className="space-y-3">
                    <div className="bg-[#0b1120] border border-[#4ade80]/30 rounded p-3">
                      <div className="text-[10px] text-[#4ade80] font-semibold mb-2">✓ Complete</div>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between text-white">
                          <span>Total:</span>
                          <span>${totalDistribution.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-[#5a7fa0]">
                          <span>Holders:</span>
                          <span>{holders.length}</span>
                        </div>
                        <div className="flex justify-between text-[#5a7fa0]">
                          <span>Period:</span>
                          <span className="capitalize">{distributionPeriod}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={resetDistribution}
                      className="w-full py-1.5 bg-[#0b1120] border border-[#1e3a5f]/50 rounded text-white text-[10px] font-medium hover:border-[#c9a84c]/30 transition-colors"
                    >
                      New Distribution
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Stage: Calculating */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                          distributionStage === 'calculating'
                            ? 'bg-[#c9a84c]/20 border border-[#c9a84c] animate-pulse'
                            : distributionStage === 'idle'
                            ? 'bg-transparent border border-[#1e3a5f]/50'
                            : 'bg-[#4ade80]/20 border border-[#4ade80] text-white font-bold'
                        }`}>
                          {['executing', 'recording', 'complete'].includes(distributionStage) && '✓'}
                        </div>
                        <span className={`text-[10px] font-medium ${
                          distributionStage === 'calculating'
                            ? 'text-[#c9a84c]'
                            : ['recording', 'complete'].includes(distributionStage)
                            ? 'text-[#4ade80]'
                            : 'text-[#5a7fa0]'
                        }`}>
                          Calculating
                        </span>
                      </div>
                    </div>

                    {/* Stage: Executing */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                          distributionStage === 'executing'
                            ? 'bg-[#c9a84c]/20 border border-[#c9a84c] animate-pulse'
                            : ['recording', 'complete'].includes(distributionStage)
                            ? 'bg-[#4ade80]/20 border border-[#4ade80] text-white font-bold'
                            : 'bg-transparent border border-[#1e3a5f]/50'
                        }`}>
                          {['recording', 'complete'].includes(distributionStage) && '✓'}
                        </div>
                        <span className={`text-[10px] font-medium ${
                          distributionStage === 'executing'
                            ? 'text-[#c9a84c]'
                            : ['recording', 'complete'].includes(distributionStage)
                            ? 'text-[#4ade80]'
                            : 'text-[#5a7fa0]'
                        }`}>
                          Executing Transfers
                        </span>
                      </div>
                      {distributionStage === 'executing' && (
                        <div className="ml-6 text-[10px] text-[#5a7fa0] mb-1">
                          {completedHolders} / {holders.length} holders
                        </div>
                      )}
                    </div>

                    {/* Stage: Recording */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                          distributionStage === 'recording'
                            ? 'bg-[#c9a84c]/20 border border-[#c9a84c] animate-pulse'
                            : distributionStage === 'complete'
                            ? 'bg-[#4ade80]/20 border border-[#4ade80] text-white font-bold'
                            : 'bg-transparent border border-[#1e3a5f]/50'
                        }`}>
                          {distributionStage === 'complete' && '✓'}
                        </div>
                        <span className={`text-[10px] font-medium ${
                          distributionStage === 'recording'
                            ? 'text-[#c9a84c]'
                            : distributionStage === 'complete'
                            ? 'text-[#4ade80]'
                            : 'text-[#5a7fa0]'
                        }`}>
                          Recording
                        </span>
                      </div>
                    </div>

                    {/* Summary when idle */}
                    {distributionStage === 'idle' && (
                      <div className="border-t border-[#1e3a5f]/30 pt-3 mt-3">
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between text-white">
                            <span>Total:</span>
                            <span className="font-semibold">${totalDistribution.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex justify-between text-[#5a7fa0]">
                            <span>Holders:</span>
                            <span>{holders.length}</span>
                          </div>
                          <div className="flex justify-between text-[#5a7fa0]">
                            <span>Per Token:</span>
                            <span>${payoutPerToken.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Distribution History Table */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg">
          {/* Panel Header */}
          <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
            <div className="text-sm font-semibold text-white">Distribution History</div>
            <div className="text-[10px] text-[#5a7fa0]">Recent distributions and transactions</div>
          </div>

          {/* Panel Content */}
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-[#1e3a5f]/20">
                    <th className="text-left py-2 px-2 text-[10px] font-semibold text-[#5a7fa0]">Date</th>
                    <th className="text-left py-2 px-2 text-[10px] font-semibold text-[#5a7fa0]">Property</th>
                    <th className="text-right py-2 px-2 text-[10px] font-semibold text-[#5a7fa0]">Total Amount</th>
                    <th className="text-right py-2 px-2 text-[10px] font-semibold text-[#5a7fa0]">Holders</th>
                    <th className="text-left py-2 px-2 text-[10px] font-semibold text-[#5a7fa0]">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDistributionHistory.map((dist, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10"
                    >
                      <td className="py-1.5 px-2 text-white">
                        {new Date(dist.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-1.5 px-2 text-[#5a7fa0]">{dist.property}</td>
                      <td className="text-right py-1.5 px-2 text-[#4ade80] font-semibold">
                        ${dist.totalAmount.toLocaleString()}
                      </td>
                      <td className="text-right py-1.5 px-2 text-white">{dist.holdersCount}</td>
                      <td className="py-1.5 px-2">
                        <a
                          href={`https://32f.blockv.io/tx/${dist.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8bb8e8] hover:text-white transition-colors font-mono text-[10px]"
                        >
                          {dist.txHash.slice(0, 10)}...
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
