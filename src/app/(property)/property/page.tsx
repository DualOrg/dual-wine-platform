'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

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
  imageGradient: string;
}

const mockProperties: Property[] = [
  {
    id: 'elysian-tower',
    name: 'The Elysian Tower',
    location: 'Manhattan, New York',
    type: 'Residential',
    totalValue: 247500000,
    tokenPrice: 125.45,
    yieldPercent: 6.8,
    fundedPercent: 94,
    sqft: 425000,
    imageGradient: 'from-amber-900 via-orange-800 to-red-900',
  },
  {
    id: 'harbour-view',
    name: 'Harbour View Residences',
    location: 'Sydney, Australia',
    type: 'Residential',
    totalValue: 189300000,
    tokenPrice: 98.32,
    yieldPercent: 7.4,
    fundedPercent: 88,
    sqft: 312000,
    imageGradient: 'from-blue-900 via-cyan-800 to-teal-900',
  },
  {
    id: 'boulevard-commerce',
    name: 'Boulevard Commerce Hub',
    location: 'London, UK',
    type: 'Commercial',
    totalValue: 156800000,
    tokenPrice: 87.6,
    yieldPercent: 8.1,
    fundedPercent: 96,
    sqft: 280000,
    imageGradient: 'from-slate-800 via-gray-700 to-zinc-800',
  },
  {
    id: 'emirates-tower',
    name: 'Emirates Crown Tower',
    location: 'Dubai, UAE',
    type: 'Mixed-Use',
    totalValue: 328750000,
    tokenPrice: 156.2,
    yieldPercent: 7.9,
    fundedPercent: 92,
    sqft: 580000,
    imageGradient: 'from-yellow-900 via-amber-800 to-orange-900',
  },
  {
    id: 'marina-prestige',
    name: 'Marina Prestige Hotel',
    location: 'Singapore',
    type: 'Hospitality',
    totalValue: 142500000,
    tokenPrice: 71.25,
    yieldPercent: 8.5,
    fundedPercent: 87,
    sqft: 198000,
    imageGradient: 'from-indigo-900 via-blue-800 to-purple-900',
  },
  {
    id: 'ocean-residences',
    name: 'Ocean Residences Miami',
    location: 'Miami, Florida',
    type: 'Residential',
    totalValue: 195600000,
    tokenPrice: 104.8,
    yieldPercent: 7.2,
    fundedPercent: 91,
    sqft: 356000,
    imageGradient: 'from-pink-900 via-rose-800 to-red-900',
  },
  {
    id: 'fintech-plaza',
    name: 'FinTech Plaza',
    location: 'Singapore',
    type: 'Commercial',
    totalValue: 178900000,
    tokenPrice: 95.45,
    yieldPercent: 7.6,
    fundedPercent: 89,
    sqft: 320000,
    imageGradient: 'from-emerald-900 via-green-800 to-teal-900',
  },
  {
    id: 'manhattan-luxury',
    name: 'Manhattan Luxury Suites',
    location: 'New York, USA',
    type: 'Hospitality',
    totalValue: 212400000,
    tokenPrice: 119.2,
    yieldPercent: 8.2,
    fundedPercent: 85,
    sqft: 234000,
    imageGradient: 'from-purple-900 via-indigo-800 to-blue-900',
  },
];

export default function PropertiesPage() {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('recommended');

  const filteredProperties = useMemo(() => {
    let filtered = mockProperties;

    // Filter by type
    if (selectedType !== 'All') {
      filtered = filtered.filter((p) => p.type === selectedType);
    }

    // Sort
    if (sortBy === 'yield') {
      filtered = [...filtered].sort((a, b) => b.yieldPercent - a.yieldPercent);
    } else if (sortBy === 'funded') {
      filtered = [...filtered].sort((a, b) => b.fundedPercent - a.fundedPercent);
    }

    return filtered;
  }, [selectedType, sortBy]);

  const totalPortfolioValue = mockProperties.reduce(
    (sum, p) => sum + p.totalValue,
    0
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20">
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(201, 168, 76, 0.1) 0%, transparent 60%)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-serif italic font-bold text-white mb-6">
            Institutional Real Estate.
            <br />
            <span className="bg-gradient-to-r from-[#c9a84c] to-[#a68832] bg-clip-text text-transparent">
              Fractional Access.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            Tokenized property investment on the DUAL Network. Access premium
            real estate with institutional-grade returns.
          </p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Portfolio Value',
              value: '$847M',
              icon: 'trending_up',
            },
            {
              label: 'Properties Listed',
              value: '23',
              icon: 'domain',
            },
            {
              label: 'Average Yield',
              value: '7.2%',
              icon: 'show_chart',
            },
            {
              label: 'Investors',
              value: '1,847',
              icon: 'group',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-6 hover:border-[#c9a84c]/20 transition-all duration-300 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-[#c9a84c]/20 to-[#a68832]/20 rounded-xl group-hover:from-[#c9a84c]/30 group-hover:to-[#a68832]/30 transition-colors">
                  <span className="material-symbols-outlined text-[#c9a84c] text-xl">
                    {stat.icon}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-serif italic font-bold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="sticky top-20 z-40 bg-[#0a0e1a]/95 backdrop-blur-2xl border-b border-white/[0.06] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              {['All', 'Residential', 'Commercial', 'Hospitality'].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedType === type
                        ? 'bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0a0e1a]'
                        : 'bg-white/[0.05] text-white/70 hover:text-white border border-white/[0.1]'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/50">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/[0.05] border border-white/[0.1] text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
              >
                <option value="recommended">Recommended</option>
                <option value="yield">Highest Yield</option>
                <option value="funded">Most Funded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Link key={property.id} href={`/property/${property.id}`}>
              <div className="group cursor-pointer h-full">
                <div className="bg-[#111827]/80 rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden hover:border-[#c9a84c]/30 transition-all duration-500 h-full flex flex-col transform hover:scale-105">
                  {/* Image Area */}
                  <div className={`h-48 bg-gradient-to-br ${property.imageGradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-[#10b981]/80 backdrop-blur text-white text-xs font-semibold rounded-full">
                        {property.type}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur text-[#c9a84c] text-xs font-semibold rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          verified
                        </span>
                        Verified Asset
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    {/* Name & Location */}
                    <div className="mb-4">
                      <h3 className="text-lg font-serif italic font-bold text-white mb-2">
                        {property.name}
                      </h3>
                      <p className="text-sm text-white/60 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          location_on
                        </span>
                        {property.location}
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Total Value</span>
                        <span className="font-semibold text-white">
                          ${(property.totalValue / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Token Price</span>
                        <span className="font-semibold text-white">
                          ${property.tokenPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Annual Yield</span>
                        <span className="font-semibold text-[#10b981]">
                          {property.yieldPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Funded Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-white/50">Funded</span>
                        <span className="text-white font-medium">
                          {property.fundedPercent}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#c9a84c] to-[#a68832] transition-all duration-500"
                          style={{ width: `${property.fundedPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full py-3 bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0a0e1a] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#c9a84c]/20 transition-all duration-300 transform hover:scale-105">
                      Invest Now
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
