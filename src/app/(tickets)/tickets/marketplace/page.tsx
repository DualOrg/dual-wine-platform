'use client'

import Link from 'next/link'
import { useState } from 'react'

interface MarketplaceListing {
  id: string
  ticketName: string
  originalPrice: number
  listingPrice: number
  seller: string
  eventDate: string
  tier: string
  listed: string
}

const MOCK_LISTINGS: MarketplaceListing[] = [
  {
    id: '1',
    ticketName: 'Neon Dreams Festival 2026 - Backstage Pass',
    originalPrice: 299,
    listingPrice: 349,
    seller: '0x7a8f...9d2c',
    eventDate: '2026-04-15',
    tier: 'Backstage Pass',
    listed: '2 hours ago',
  },
  {
    id: '2',
    ticketName: 'Virtual Reality Concert Series - VIP',
    originalPrice: 149,
    listingPrice: 175,
    seller: '0x4b3e...6a1f',
    eventDate: '2026-05-22',
    tier: 'VIP Experience',
    listed: '5 hours ago',
  },
  {
    id: '3',
    ticketName: 'Crypto Cup 2026 - Executive Suite',
    originalPrice: 799,
    listingPrice: 799,
    seller: '0x2d9c...5e7b',
    eventDate: '2026-06-10',
    tier: 'Executive Suite',
    listed: '1 day ago',
  },
  {
    id: '4',
    ticketName: 'The Holographic Opera - Main Floor',
    originalPrice: 249,
    listingPrice: 229,
    seller: '0x8f2a...4c9e',
    eventDate: '2026-07-08',
    tier: 'Main Floor Exclusive',
    listed: '3 days ago',
  },
  {
    id: '5',
    ticketName: 'Synth Wave Night - VIP Experience',
    originalPrice: 125,
    listingPrice: 145,
    seller: '0x5e6d...3a9f',
    eventDate: '2026-07-19',
    tier: 'VIP',
    listed: '4 hours ago',
  },
  {
    id: '6',
    ticketName: 'Future Tech Innovators Summit - VIP',
    originalPrice: 399,
    listingPrice: 425,
    seller: '0x1c2b...8f4d',
    eventDate: '2026-09-12',
    tier: 'VIP Access',
    listed: '6 hours ago',
  },
]

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest')
  const [filterTier, setFilterTier] = useState<string>('all')

  const tiers = ['all', 'General Admission', 'VIP', 'VIP Experience', 'Backstage Pass', 'Executive Suite', 'Main Floor Exclusive']

  const filteredListings =
    filterTier === 'all'
      ? MOCK_LISTINGS
      : MOCK_LISTINGS.filter((l) => l.tier === filterTier)

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price-asc') return a.listingPrice - b.listingPrice
    if (sortBy === 'price-desc') return b.listingPrice - a.listingPrice
    return 0
  })

  return (
    <div className="min-h-screen relative">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-[#00f0ff] via-[#ff2d78] to-[#39ff14] bg-clip-text text-transparent">
            Ticket Marketplace
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Trade verified tickets with anti-scalp protection. All listings are enforced by smart contracts.
          </p>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          {/* Filter by Tier */}
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-3 font-semibold">Filter by Tier</p>
            <div className="flex flex-wrap gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterTier === tier
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:border-[#00f0ff]/50'
                  }`}
                >
                  {tier === 'all' ? 'All Tiers' : tier}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm text-gray-400 mb-3 font-semibold block">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#00f0ff] focus:outline-none transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedListings.map((listing) => {
            const priceChange = listing.listingPrice - listing.originalPrice
            const priceChangePercent =
              ((priceChange / listing.originalPrice) * 100).toFixed(1)

            return (
              <div
                key={listing.id}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 hover:border-[#00f0ff]/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-300 flex flex-col"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-[#00f0ff] transition-colors flex-1">
                      {listing.ticketName}
                    </h3>
                  </div>
                  <div className="inline-flex px-2 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                    <span className="text-xs font-semibold text-[#00f0ff]">
                      {listing.tier}
                    </span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="mb-4 space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">
                      calendar_month
                    </span>
                    {new Date(listing.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">
                      account_circle
                    </span>
                    {listing.seller}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">
                      schedule
                    </span>
                    {listing.listed}
                  </div>
                </div>

                {/* Price Section */}
                <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Original Price</p>
                    <p className="text-sm text-gray-400 line-through">
                      ${listing.originalPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Listing</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-black text-[#00f0ff]">
                        ${listing.listingPrice}
                      </p>
                      <span
                        className={`text-xs font-bold ${
                          priceChange > 0
                            ? 'text-[#ff2d78]'
                            : priceChange < 0
                              ? 'text-[#39ff14]'
                              : 'text-gray-400'
                        }`}
                      >
                        {priceChange > 0 ? '+' : ''}
                        {priceChangePercent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00f0ff]/20 to-[#ff2d78]/20 border border-[#00f0ff]/30 text-[#00f0ff] font-bold hover:from-[#00f0ff]/40 hover:to-[#ff2d78]/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    shopping_cart
                  </span>
                  Buy Now
                </button>
              </div>
            )
          })}
        </div>

        {/* No Results */}
        {sortedListings.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-8xl text-[#00f0ff]/30 block mb-6">
              search
            </span>
            <h2 className="text-3xl font-bold text-white mb-4">No Listings Found</h2>
            <p className="text-gray-400">
              Try adjusting your filters to see more listings.
            </p>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="border border-[#39ff14]/30 rounded-2xl p-8 bg-gradient-to-r from-[#39ff14]/5 to-transparent">
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#39ff14]">
              shield_verified
            </span>
            Safe Trading with Anti-Scalp Protection
          </h3>
          <p className="text-gray-300 mb-4">
            Every transaction on DUAL Marketplace is protected by smart contracts that enforce price boundaries. Sellers cannot list above the price ceiling, and buyers cannot undercut below the price floor.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Automated price verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Transparent transaction history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Instant on-chain settlement</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
