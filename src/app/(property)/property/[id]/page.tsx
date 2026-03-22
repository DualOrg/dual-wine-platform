'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
  location: string;
  type: 'Residential' | 'Commercial' | 'Mixed-Use' | 'Hospitality';
  totalValue: number;
  tokenPrice: number;
  yieldPercent: number;
  fundedPercent: number;
  sqft: number;
  yearBuilt?: number;
  units?: number;
  description?: string;
  features?: string[];
  rentalIncome?: number;
  expenses?: number;
  capRate?: number;
  projectedReturn?: number;
  contractAddress?: string;
  integrityHash?: string;
  ownerAddress?: string;
}

const mockProperties: Record<string, Property> = {
  'elysian-tower': {
    id: 'elysian-tower',
    name: 'The Elysian Tower',
    location: '432 Park Avenue, Manhattan, New York',
    type: 'Residential',
    totalValue: 247500000,
    tokenPrice: 125.45,
    yieldPercent: 6.8,
    fundedPercent: 94,
    sqft: 425000,
    yearBuilt: 2015,
    units: 428,
    description:
      'A stunning residential tower in the heart of Manhattan offering unparalleled luxury and investment returns. Premium finishes, world-class amenities, and exceptional location.',
    features: [
      'Rooftop infinity pool',
      'Private cinema',
      'Concierge service',
      'Underground parking',
      'Smart home integration',
      'Floor-to-ceiling windows',
    ],
    rentalIncome: 18500000,
    expenses: 4200000,
    capRate: 5.8,
    projectedReturn: 12.4,
    contractAddress: '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06',
    integrityHash: '0x7f8c4d2b9a1e5c6d3f2a8b7c9e1d5a3f2c8d4e6a7b9c1d3e5f7a9b2c4d6e8f',
    ownerAddress: '0x8f9e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
  },
  'harbour-view': {
    id: 'harbour-view',
    name: 'Harbour View Residences',
    location: '26 Martin Place, Sydney, Australia',
    type: 'Residential',
    totalValue: 189300000,
    tokenPrice: 98.32,
    yieldPercent: 7.4,
    fundedPercent: 88,
    sqft: 312000,
    yearBuilt: 2018,
    units: 284,
    description:
      'Iconic Sydney harbour-view complex combining modern architecture with premium amenities. Strong rental demand and capital appreciation.',
    features: [
      'Harbour views',
      'Infinity pool complex',
      'Yoga studios',
      'Wine cellar',
      'Business center',
      'Waterfront terrace',
    ],
    rentalIncome: 14100000,
    expenses: 3100000,
    capRate: 5.9,
    projectedReturn: 11.8,
    contractAddress: '0x52aB0f5a7c4e2d1f9b3e8c7a5d6f2b1a4c9e3d7f',
    integrityHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    ownerAddress: '0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
  },
  'boulevard-commerce': {
    id: 'boulevard-commerce',
    name: 'Boulevard Commerce Hub',
    location: '100 Bishopsgate, London, UK',
    type: 'Commercial',
    totalValue: 156800000,
    tokenPrice: 87.6,
    yieldPercent: 8.1,
    fundedPercent: 96,
    sqft: 280000,
    yearBuilt: 2020,
    units: 15,
    description:
      'Premier London commercial hub featuring modern architecture and premium office space. Strong capital appreciation potential with excellent tenant base.',
    features: [
      'Grade A office space',
      'High-speed connectivity',
      'Luxury retail units',
      'Climate control',
      'Advanced security',
      'Rooftop terrace',
    ],
    rentalIncome: 12800000,
    expenses: 2900000,
    capRate: 6.4,
    projectedReturn: 10.2,
    contractAddress: '0x9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c',
    integrityHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    ownerAddress: '0x0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
  },
  'neon-gardens': {
    id: 'neon-gardens',
    name: 'Neon Gardens Apartments',
    location: '789 Silicon Valley Blvd, San Francisco, CA',
    type: 'Residential',
    totalValue: 312500000,
    tokenPrice: 156.25,
    yieldPercent: 5.9,
    fundedPercent: 91,
    sqft: 580000,
    yearBuilt: 2021,
    units: 350,
    description:
      'Ultra-modern residential complex in the heart of Silicon Valley with cutting-edge smart home technology and sustainable design.',
    features: [
      'Smart home integration',
      'Solar panels',
      'Co-working spaces',
      'Fitness center',
      'Rooftop garden',
      'EV charging stations',
    ],
    rentalIncome: 22000000,
    expenses: 5100000,
    capRate: 5.4,
    projectedReturn: 11.9,
    contractAddress: '0x1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d',
    integrityHash: '0x0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e',
    ownerAddress: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d',
  },
};

const getPriceHistoryData = () => [
  120.5, 121.2, 119.8, 122.4, 123.1, 121.9, 124.5, 125.8, 124.2, 126.3, 127.1, 125.45,
];

function drawLineChart(
  canvas: HTMLCanvasElement,
  data: number[],
  lineColor: string,
  areaColor: string
) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, width, height);

  const minValue = Math.min(...data) - 5;
  const maxValue = Math.max(...data) + 5;
  const range = maxValue - minValue;

  ctx.strokeStyle = 'rgba(94, 122, 160, 0.2)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = padding + (graphHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();

    const value = maxValue - (range / 4) * i;
    ctx.fillStyle = '#5a7fa0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('$' + value.toFixed(0), padding - 10, y + 3);
  }

  ctx.strokeStyle = '#5a7fa0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const pointSpacing = graphWidth / (data.length - 1);

  const points = data.map((value, index) => ({
    x: padding + pointSpacing * index,
    y: padding + graphHeight - ((value - minValue) / range) * graphHeight,
  }));

  const gradientArea = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradientArea.addColorStop(0, areaColor + '40');
  gradientArea.addColorStop(1, areaColor + '00');

  ctx.fillStyle = gradientArea;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((point) => {
    ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(points[points.length - 1].x, height - padding);
  ctx.lineTo(padding, height - padding);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((point) => {
    ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = mockProperties[params.id];
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [investLoading, setInvestLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawLineChart(canvasRef.current, getPriceHistoryData(), '#c9a84c', '#c9a84c');
    }
  }, []);

  if (!property) {
    return (
      <div className="bg-[#0b1120] min-h-screen py-12 px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg p-8">
            <p className="text-white text-center">Property not found</p>
          </div>
        </div>
      </div>
    );
  }

  const tokens = Math.floor(investmentAmount / property.tokenPrice);
  const monthlyYield = (investmentAmount * property.yieldPercent) / 100 / 12;

  const handleInvest = async () => {
    setInvestLoading(true);
    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          amount: investmentAmount,
          tokens,
        }),
      });
      if (response.ok) {
        alert('Investment successful!');
        setInvestmentAmount(10000);
      }
    } catch (error) {
      console.error('Investment failed:', error);
    } finally {
      setInvestLoading(false);
    }
  };

  const handleTransfer = async () => {
    setTransferLoading(true);
    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          to: transferEmail,
          tokens,
        }),
      });
      if (response.ok) {
        alert('Transfer successful!');
        setShowTransferModal(false);
        setTransferEmail('');
      }
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="bg-[#0b1120] min-h-screen py-6">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Grid: 3 rows of dashboard panels */}

        {/* ROW 1: Property Overview, Financial Summary, On-Chain Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Property Overview Panel */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-6">
            <div className="pb-2 mb-4 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">{property.name}</p>
              <p className="text-[10px] text-[#5a7fa0]">{property.location}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-[#5a7fa0]">Type</p>
                <p className="text-[11px] text-white font-semibold">{property.type}</p>
              </div>
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-[#5a7fa0]">Status</p>
                <span className="inline-block bg-[#4ade80]/20 text-[#4ade80] px-2 py-1 rounded text-[10px] font-semibold">
                  Funded {property.fundedPercent}%
                </span>
              </div>
              <div className="pt-2 border-t border-[#1e3a5f]/20">
                <p className="text-[10px] text-[#5a7fa0] mb-2">Description</p>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Summary Panel */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-6">
            <div className="pb-2 mb-4 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">Financial Summary</p>
              <p className="text-[10px] text-[#5a7fa0]">Key metrics</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Total Value</p>
                <p className="text-[11px] text-white font-semibold">
                  ${(property.totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Token Price</p>
                <p className="text-[11px] text-white font-semibold">
                  ${property.tokenPrice.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Annual Yield</p>
                <p className="text-[11px] text-[#4ade80] font-semibold">
                  {property.yieldPercent}%
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Cap Rate</p>
                <p className="text-[11px] text-white font-semibold">
                  {property.capRate?.toFixed(1)}%
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Projected Return</p>
                <p className="text-[11px] text-[#4ade80] font-semibold">
                  {property.projectedReturn?.toFixed(1)}%
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Funded</p>
                <p className="text-[11px] text-white font-semibold">
                  {property.fundedPercent}%
                </p>
              </div>
            </div>
          </div>

          {/* On-Chain Verification Panel */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-6">
            <div className="pb-2 mb-4 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">On-Chain Verification</p>
              <p className="text-[10px] text-[#5a7fa0]">Blockchain details</p>
            </div>
            <div className="space-y-3 text-[10px]">
              <div>
                <p className="text-[#5a7fa0] mb-1">Contract Address</p>
                <p className="text-[11px] text-white font-mono truncate">
                  {property.contractAddress || '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06'}
                </p>
              </div>
              <div>
                <p className="text-[#5a7fa0] mb-1">Integrity Hash</p>
                <p className="text-[11px] text-white font-mono truncate">
                  {property.integrityHash || '0x7f8c4d2b9a1e5c6d3f2a8b7c9e1d5a3f...'}
                </p>
              </div>
              <div>
                <p className="text-[#5a7fa0] mb-1">Owner Address</p>
                <p className="text-[11px] text-white font-mono truncate">
                  {property.ownerAddress || '0x8f9e7d6c5b4a3f2e1d0c9b8a7f6e5d4c...'}
                </p>
              </div>
              <div className="pt-2 border-t border-[#1e3a5f]/20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#4ade80] rounded-full"></span>
                  <p className="text-[10px] text-[#4ade80]">Chain Status: Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Token Price History, Investment Calculator, Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Token Price History Chart */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-4">
            <div className="pb-2 mb-3 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">Token Price History</p>
              <p className="text-[10px] text-[#5a7fa0]">Last 12 months</p>
            </div>
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="w-full h-auto"
            />
          </div>

          {/* Investment Calculator Panel */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-6">
            <div className="pb-2 mb-4 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">Investment Calculator</p>
              <p className="text-[10px] text-[#5a7fa0]">Compute your investment</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#5a7fa0] mb-1 block">Investment Amount</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]"
                />
              </div>
              <div>
                <p className="text-[10px] text-[#5a7fa0] mb-1">Tokens Purchased</p>
                <p className="text-[11px] text-white font-semibold">
                  {tokens.toLocaleString()} tokens
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#5a7fa0] mb-1">Monthly Yield</p>
                <p className="text-[11px] text-[#4ade80] font-semibold">
                  ${monthlyYield.toFixed(2)}
                </p>
              </div>
              <div className="pt-3 border-t border-[#1e3a5f]/20">
                <button
                  onClick={handleInvest}
                  disabled={investLoading}
                  className="w-full bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] font-bold py-2 rounded text-xs hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {investLoading ? 'Processing...' : 'Buy Tokens'}
                </button>
              </div>
            </div>
          </div>

          {/* Property Specifications Panel */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-6">
            <div className="pb-2 mb-4 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">Property Specifications</p>
              <p className="text-[10px] text-[#5a7fa0]">Physical details</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Square Feet</p>
                <p className="text-[11px] text-white font-semibold">
                  {(property.sqft / 1000).toFixed(0)}K sq ft
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Year Built</p>
                <p className="text-[11px] text-white font-semibold">
                  {property.yearBuilt}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Units</p>
                <p className="text-[11px] text-white font-semibold">
                  {property.units}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-[#5a7fa0]">Type</p>
                <p className="text-[11px] text-white font-semibold">
                  {property.type}
                </p>
              </div>
              {property.features && property.features.length > 0 && (
                <div className="pt-2 border-t border-[#1e3a5f]/20">
                  <p className="text-[10px] text-[#5a7fa0] mb-2">Features</p>
                  <ul className="space-y-1">
                    {property.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="text-[10px] text-white/80">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 3: Rental Income Breakdown Table (full width) */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-6">
          <div className="pb-2 mb-4 border-b border-[#1e3a5f]/20">
            <p className="text-sm font-semibold text-white">Rental Income Breakdown</p>
            <p className="text-[10px] text-[#5a7fa0]">Annual financials</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#1e3a5f]/20">
                  <th className="text-left py-2 px-3 text-[#5a7fa0] font-semibold">
                    Metric
                  </th>
                  <th className="text-right py-2 px-3 text-[#5a7fa0] font-semibold">
                    Amount
                  </th>
                  <th className="text-right py-2 px-3 text-[#5a7fa0] font-semibold">
                    Per Token
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10 transition-colors">
                  <td className="py-3 px-3 text-white">Annual Rental Income</td>
                  <td className="py-3 px-3 text-right text-white font-semibold">
                    ${(property.rentalIncome! / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 px-3 text-right text-[#4ade80] font-semibold">
                    ${(property.rentalIncome! / 2000000).toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10 transition-colors">
                  <td className="py-3 px-3 text-white">Annual Expenses</td>
                  <td className="py-3 px-3 text-right text-white font-semibold">
                    ${(property.expenses! / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 px-3 text-right text-[#ef4444] font-semibold">
                    -${(property.expenses! / 2000000).toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10 transition-colors">
                  <td className="py-3 px-3 text-white font-semibold">Net Operating Income</td>
                  <td className="py-3 px-3 text-right text-white font-semibold">
                    ${((property.rentalIncome! - property.expenses!) / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 px-3 text-right text-[#4ade80] font-semibold">
                    ${(
                      (property.rentalIncome! - property.expenses!) /
                      2000000
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 bg-[#0f1b2e] border border-[#1e3a5f]/50 text-white rounded text-xs font-semibold hover:border-[#c9a84c]/50 transition-colors"
          >
            Transfer Tokens
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#0f1b2e] border border-[#1e3a5f]/50 text-white rounded text-xs font-semibold hover:border-[#8bb8e8]/50 transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg p-6 max-w-sm w-full">
            <div className="pb-4 mb-4 border-b border-[#1e3a5f]/20">
              <p className="text-sm font-semibold text-white">Transfer Tokens</p>
              <p className="text-[10px] text-[#5a7fa0]">Send tokens to another address</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#5a7fa0] mb-2 block">Recipient Address</label>
                <input
                  type="email"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 text-xs text-white placeholder-[#5a7fa0]"
                />
              </div>
              <div>
                <p className="text-[10px] text-[#5a7fa0] mb-1">Amount to Transfer</p>
                <p className="text-[11px] text-white font-semibold">
                  {tokens.toLocaleString()} tokens (${investmentAmount.toFixed(2)})
                </p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-[#1e3a5f]/20">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-2 bg-[#0b1120] border border-[#1e3a5f]/50 text-white rounded text-xs font-semibold hover:border-[#1e3a5f] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={transferLoading || !transferEmail}
                  className="flex-1 py-2 bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] rounded text-xs font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {transferLoading ? 'Transferring...' : 'Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
