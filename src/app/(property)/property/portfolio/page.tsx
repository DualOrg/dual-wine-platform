'use client';

import { useState, useEffect, useRef } from 'react';

interface Holding {
  id: string;
  name: string;
  location: string;
  sharesOwned: number;
  totalShares: number;
  currentValue: number;
  purchaseValue: number;
  monthlyYield: number;
}

const mockHoldings: Holding[] = [
  {
    id: 'elysian-tower',
    name: 'The Elysian Tower',
    location: 'Manhattan, New York',
    sharesOwned: 8450,
    totalShares: 2000000,
    currentValue: 1058900,
    purchaseValue: 945000,
    monthlyYield: 4850,
  },
  {
    id: 'harbour-view',
    name: 'Harbour View Residences',
    location: 'Sydney, Australia',
    sharesOwned: 5200,
    totalShares: 1920000,
    currentValue: 511264,
    purchaseValue: 475200,
    monthlyYield: 3125,
  },
  {
    id: 'boulevard-commerce',
    name: 'Boulevard Commerce Hub',
    location: 'London, UK',
    sharesOwned: 6800,
    totalShares: 1789000,
    currentValue: 595680,
    purchaseValue: 548000,
    monthlyYield: 4012,
  },
];

export default function PortfolioPage() {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [liveHoldings, setLiveHoldings] = useState<Holding[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState<string | null>(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferring, setTransferring] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch live properties
  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((data) => {
        const props = data.properties || [];
      })
      .catch(() => {});
  }, []);

  // Number animation effect
  useEffect(() => {
    const allHoldings = [...liveHoldings, ...mockHoldings];
    const targets = {
      totalInvestment: allHoldings.reduce((sum, h) => sum + h.currentValue, 0),
      totalYield: allHoldings.reduce(
        (sum, h) => sum + (h.currentValue - h.purchaseValue),
        0
      ),
      monthlyIncome: allHoldings.reduce((sum, h) => sum + h.monthlyYield, 0),
    };

    Object.keys(targets).forEach((key) => {
      let current = 0;
      const target = targets[key as keyof typeof targets];
      const increment = target / 30;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues((prev) => ({
          ...prev,
          [key]: current,
        }));
      }, 30);

      return () => clearInterval(timer);
    });
  }, [liveHoldings]);

  // Draw yield history chart
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = [12500, 13200, 11800, 14300, 15100, 16400, 17200, 18900, 19800, 20400, 21200, 20800];
    const maxValue = Math.max(...data);
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, i) => {
      const x = padding + (i / (data.length - 1)) * graphWidth;
      const y = height - padding - (value / maxValue) * graphHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    ctx.fillStyle = '#c9a84c';
    data.forEach((value, i) => {
      const x = padding + (i / (data.length - 1)) * graphWidth;
      const y = height - padding - (value / maxValue) * graphHeight;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const allHoldings = [...liveHoldings, ...mockHoldings];
  const totalInvestment = allHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalYield = allHoldings.reduce(
    (sum, h) => sum + (h.currentValue - h.purchaseValue),
    0
  );
  const monthlyIncome = allHoldings.reduce((sum, h) => sum + h.monthlyYield, 0);
  const gainPercent =
    (totalYield /
      allHoldings.reduce((sum, h) => sum + h.purchaseValue, 0)) *
    100;

  const handleClaimYield = async (propertyId: string) => {
    setClaimingId(propertyId);
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/claim-yield`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (response.ok) {
        setClaimSuccess(propertyId);
        setTimeout(() => setClaimSuccess(null), 3000);
      }
    } catch (error) {
      alert('Error claiming yield');
    } finally {
      setClaimingId(null);
    }
  };

  const handleTransfer = async (propertyId: string) => {
    if (!transferEmail) {
      alert('Please enter an email address');
      return;
    }

    setTransferring(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: transferEmail,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(
          `Transfer initiated! Transaction: ${data.transactionHash}`
        );
        setShowTransferModal(null);
        setTransferEmail('');
      } else {
        alert('Transfer failed: ' + data.error);
      }
    } catch (error) {
      alert('Error processing transfer');
    } finally {
      setTransferring(false);
    }
  };

  const handleSell = async (propertyId: string) => {
    alert('Sell functionality coming soon');
  };

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">

        {/* Top Row: 4 Summary Stat Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Value */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2">
            <p className="text-[10px] text-[#5a7fa0] mb-1">Total Value</p>
            <p className="text-white font-semibold text-lg">
              ${(animatedValues.totalInvestment || 0).toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          {/* Total P&L */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2">
            <p className="text-[10px] text-[#5a7fa0] mb-1">Total P&L</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-white font-semibold text-lg ${totalYield >= 0 ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
                ${(animatedValues.totalYield || 0).toLocaleString('en-US', {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className={`text-xs ${totalYield >= 0 ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
                {totalYield >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Monthly Yield */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2">
            <p className="text-[10px] text-[#5a7fa0] mb-1">Monthly Yield</p>
            <p className="text-[#4ade80] font-semibold text-lg">
              ${(animatedValues.monthlyIncome || 0).toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          {/* Properties Held */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2">
            <p className="text-[10px] text-[#5a7fa0] mb-1">Properties Held</p>
            <p className="text-white font-semibold text-lg">{allHoldings.length}</p>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
          <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
            <p className="text-sm font-semibold text-white">Holdings</p>
            <p className="text-[10px] text-[#5a7fa0]">Portfolio breakdown</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#1e3a5f]/20 bg-[#0b1120]">
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#5a7fa0]">Property</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#5a7fa0]">Location</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-[#5a7fa0]">Shares</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-[#5a7fa0]">Value</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-[#5a7fa0]">P&L ($)</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-[#5a7fa0]">P&L (%)</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold text-[#5a7fa0]">Monthly Yield</th>
                </tr>
              </thead>
              <tbody>
                {allHoldings.map((holding) => {
                  const gainLoss = holding.currentValue - holding.purchaseValue;
                  const gainPercent = (gainLoss / holding.purchaseValue) * 100;
                  const ownershipPercent = (holding.sharesOwned / holding.totalShares) * 100;

                  return (
                    <tr key={holding.id} className="border-b border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10">
                      <td className="px-4 py-2 text-white">{holding.name}</td>
                      <td className="px-4 py-2 text-[#5a7fa0]">{holding.location}</td>
                      <td className="px-4 py-2 text-right text-white">{ownershipPercent.toFixed(2)}%</td>
                      <td className="px-4 py-2 text-right text-white">
                        ${holding.currentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </td>
                      <td className={`px-4 py-2 text-right ${gainLoss >= 0 ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
                        ${gainLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </td>
                      <td className={`px-4 py-2 text-right ${gainPercent >= 0 ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
                        {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 text-right text-[#4ade80]">
                        ${holding.monthlyYield.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Row: 3 Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Allocation Breakdown */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">Allocation</p>
              <p className="text-[10px] text-[#5a7fa0]">Portfolio breakdown</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              {allHoldings.map((holding) => {
                const percentage = (holding.currentValue / totalInvestment) * 100;
                return (
                  <div key={holding.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5a7fa0] truncate mr-2">{holding.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-12 bg-[#1e3a5f]/30 rounded h-1.5 overflow-hidden">
                        <div
                          className="bg-[#c9a84c] h-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold w-8 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Yield History Chart */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">Yield History</p>
              <p className="text-[10px] text-[#5a7fa0]">12-month trend</p>
            </div>
            <div className="px-2 py-3">
              <canvas
                ref={canvasRef}
                width={280}
                height={140}
                className="w-full"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">Actions</p>
              <p className="text-[10px] text-[#5a7fa0]">Quick access</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  const propertyId = allHoldings[0]?.id;
                  if (propertyId) handleClaimYield(propertyId);
                }}
                disabled={claimingId !== null}
                className="w-full bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] font-bold py-1.5 rounded text-xs hover:shadow-lg hover:shadow-[#c9a84c]/20 transition-all disabled:opacity-50"
              >
                {claimingId ? 'Claiming...' : 'Claim Yield'}
              </button>
              <button
                onClick={() => setShowTransferModal(allHoldings[0]?.id || null)}
                className="w-full bg-[#1e3a5f]/30 border border-[#1e3a5f]/50 text-[#8bb8e8] font-bold py-1.5 rounded text-xs hover:bg-[#1e3a5f]/50 transition-all"
              >
                Transfer
              </button>
              <button
                onClick={() => handleSell(allHoldings[0]?.id || '')}
                className="w-full bg-[#1e3a5f]/30 border border-[#1e3a5f]/50 text-[#8bb8e8] font-bold py-1.5 rounded text-xs hover:bg-[#1e3a5f]/50 transition-all"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg p-4 max-w-sm w-full">
            <p className="text-sm font-semibold text-white mb-4">Transfer Tokens</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[10px] text-[#5a7fa0] mb-1.5">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9a84c]/50 placeholder-[#5a7fa0]"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowTransferModal(null);
                  setTransferEmail('');
                }}
                className="flex-1 bg-[#0b1120] border border-[#1e3a5f]/50 text-[#8bb8e8] py-1.5 rounded text-xs font-bold hover:border-[#1e3a5f] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTransfer(showTransferModal)}
                disabled={transferring || !transferEmail}
                className="flex-1 bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] py-1.5 rounded text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {transferring ? 'Sending...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
