'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Listing {
  id: string;
  propertyId: string;
  propertyName: string;
  tokenCount: number;
  pricePerToken: number;
  totalValue: number;
  sellerRating: number;
  premium: number;
  originalTokenPrice: number;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface TradeHistory {
  id: string;
  timestamp: string;
  tokenCount: number;
  pricePerToken: number;
  totalValue: number;
  buyer: string;
  seller: string;
}

const mockProperties = [
  { id: 'elysian-tower', name: 'The Elysian Tower', type: 'Residential' },
  { id: 'harbour-view', name: 'Harbour View Residences', type: 'Residential' },
  { id: 'boulevard-commerce', name: 'Boulevard Commerce Hub', type: 'Commercial' },
  { id: 'emirates-tower', name: 'Emirates Crown Tower', type: 'Mixed-Use' },
  { id: 'marina-prestige', name: 'Marina Prestige Hotel', type: 'Hospitality' },
];

const mockListings: Listing[] = [
  {
    id: 'list_001',
    propertyId: 'elysian-tower',
    propertyName: 'The Elysian Tower',
    tokenCount: 500,
    pricePerToken: 128.5,
    totalValue: 64250,
    sellerRating: 4.9,
    premium: 2.4,
    originalTokenPrice: 125.45,
  },
  {
    id: 'list_002',
    propertyId: 'harbour-view',
    propertyName: 'Harbour View Residences',
    tokenCount: 320,
    pricePerToken: 96.8,
    totalValue: 30976,
    sellerRating: 4.7,
    premium: -1.5,
    originalTokenPrice: 98.32,
  },
  {
    id: 'list_003',
    propertyId: 'boulevard-commerce',
    propertyName: 'Boulevard Commerce Hub',
    tokenCount: 750,
    pricePerToken: 89.2,
    totalValue: 66900,
    sellerRating: 4.8,
    premium: 1.8,
    originalTokenPrice: 87.6,
  },
  {
    id: 'list_004',
    propertyId: 'emirates-tower',
    propertyName: 'Emirates Crown Tower',
    tokenCount: 200,
    pricePerToken: 159.5,
    totalValue: 31900,
    sellerRating: 5.0,
    premium: 2.1,
    originalTokenPrice: 156.2,
  },
  {
    id: 'list_005',
    propertyId: 'marina-prestige',
    propertyName: 'Marina Prestige Hotel',
    tokenCount: 450,
    pricePerToken: 73.8,
    totalValue: 33210,
    sellerRating: 4.6,
    premium: 3.5,
    originalTokenPrice: 71.25,
  },
  {
    id: 'list_006',
    propertyId: 'boulevard-commerce',
    propertyName: 'Boulevard Commerce Hub',
    tokenCount: 600,
    pricePerToken: 87.9,
    totalValue: 52740,
    sellerRating: 4.5,
    premium: 0.3,
    originalTokenPrice: 87.6,
  },
];

const mockTradeHistory: TradeHistory[] = [
  {
    id: 'trade_001',
    timestamp: '2026-03-21T14:30:00Z',
    tokenCount: 250,
    pricePerToken: 127.5,
    totalValue: 31875,
    buyer: '0x742d35...cCA',
    seller: '0x8ba1f1...a72',
  },
  {
    id: 'trade_002',
    timestamp: '2026-03-21T13:15:00Z',
    tokenCount: 400,
    pricePerToken: 95.2,
    totalValue: 38080,
    buyer: '0xf39Fd6...266',
    seller: '0x70997...FA',
  },
  {
    id: 'trade_003',
    timestamp: '2026-03-21T12:45:00Z',
    tokenCount: 150,
    pricePerToken: 159.0,
    totalValue: 23850,
    buyer: '0x3C44Cd...e73',
    seller: '0x90F79...5Bf',
  },
];

export default function TradePage() {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showPurchaseModal, setShowPurchaseModal] = useState<string | null>(null);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseStage, setPurchaseStage] = useState<
    'idle' | 'settling' | 'confirming' | 'complete'
  >('idle');

  const filteredListings =
    selectedType === 'All'
      ? mockListings
      : mockListings.filter(
          (l) =>
            mockProperties.find((p) => p.id === l.propertyId)?.type ===
            selectedType
        );

  const marketStats = {
    totalVolume: 1245000,
    activeListings: filteredListings.length,
    avgPremium:
      filteredListings.reduce((sum, l) => sum + l.premium, 0) /
      filteredListings.length,
    trades24h: 12,
  };

  const generateOrderBook = (): {
    buyOrders: OrderBookEntry[];
    sellOrders: OrderBookEntry[];
  } => {
    const buyOrders: OrderBookEntry[] = [
      { price: 124.5, quantity: 150, total: 18675 },
      { price: 123.8, quantity: 200, total: 24760 },
      { price: 123.0, quantity: 100, total: 12300 },
    ];
    const sellOrders: OrderBookEntry[] = [
      { price: 126.5, quantity: 180, total: 22770 },
      { price: 127.2, quantity: 220, total: 27984 },
      { price: 128.0, quantity: 160, total: 20480 },
    ];
    return { buyOrders, sellOrders };
  };

  const orderBook = generateOrderBook();

  const handlePurchase = async (listingId: string) => {
    if (!buyerEmail) {
      alert('Please enter your email');
      return;
    }

    setPurchasing(true);
    setPurchaseStage('settling');

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPurchaseStage('confirming');

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const listing = mockListings.find((l) => l.id === listingId);
      if (!listing) throw new Error('Listing not found');

      const response = await fetch(
        `/api/properties/${listing.propertyId}/buy-tokens`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId,
            buyerEmail,
            tokenCount: listing.tokenCount,
          }),
        }
      );

      if (response.ok) {
        setPurchaseStage('complete');
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      alert('Error processing purchase: ' + (error as Error).message);
      setPurchaseStage('idle');
    } finally {
      setPurchasing(false);
    }
  };

  const resetPurchase = () => {
    setShowPurchaseModal(null);
    setBuyerEmail('');
    setPurchaseStage('idle');
  };

  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* Header */}
      <div className="border-b border-[#1e3a5f]/50 px-4 py-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white font-bold text-lg">Token Exchange</h1>
            <Link
              href="/property"
              className="text-[#8bb8e8] hover:text-white text-xs transition-colors"
            >
              ← Back
            </Link>
          </div>
          <p className="text-[#5a7fa0] text-[10px]">Secondary market for property tokens</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Market Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {
              label: 'Total Volume',
              value: `$${(marketStats.totalVolume / 1000).toFixed(0)}K`,
            },
            {
              label: 'Active Listings',
              value: marketStats.activeListings.toString(),
            },
            {
              label: 'Avg Premium',
              value: `${marketStats.avgPremium.toFixed(2)}%`,
            },
            {
              label: '24h Trades',
              value: marketStats.trades24h.toString(),
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg px-4 pt-4 pb-2"
            >
              <p className="text-[#5a7fa0] text-[10px] mb-1">{stat.label}</p>
              <p className="text-white font-bold text-sm">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Type Filter */}
        <div className="mb-6 flex gap-2">
          {['All', 'Residential', 'Commercial', 'Mixed-Use', 'Hospitality'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 text-xs rounded transition-all ${
                selectedType === type
                  ? 'bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] font-bold'
                  : 'bg-[#0f1b2e] border border-[#1e3a5f]/50 text-[#8bb8e8] hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Main Grid: Left (Active Listings) + Right (Order Book) */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Left: Active Listings Table (2 columns) */}
          <div className="col-span-2 bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
              <h2 className="text-white text-sm font-semibold">Active Listings</h2>
              <p className="text-[#5a7fa0] text-[10px]">{filteredListings.length} available</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0b1120]/50">
                  <tr className="border-b border-[#1e3a5f]/20">
                    <th className="text-left px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Property</th>
                    <th className="text-right px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Tokens</th>
                    <th className="text-right px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Price/Token</th>
                    <th className="text-right px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Premium</th>
                    <th className="text-right px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Total</th>
                    <th className="text-center px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="border-b border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10">
                      <td className="px-4 py-2 text-white text-[11px]">{listing.propertyName}</td>
                      <td className="text-right px-4 py-2 text-white text-[11px]">{listing.tokenCount.toLocaleString()}</td>
                      <td className="text-right px-4 py-2 text-white text-[11px]">${listing.pricePerToken.toFixed(2)}</td>
                      <td className={`text-right px-4 py-2 text-[11px] ${
                        listing.premium >= 0 ? 'text-[#4ade80]' : 'text-[#ef4444]'
                      }`}>
                        {listing.premium >= 0 ? '+' : ''}{listing.premium.toFixed(2)}%
                      </td>
                      <td className="text-right px-4 py-2 text-white font-bold text-[11px]">
                        ${listing.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="text-center px-4 py-2">
                        <button
                          onClick={() => setShowPurchaseModal(listing.id)}
                          className="px-2 py-1 bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] text-[10px] font-bold rounded hover:shadow-lg transition-all"
                        >
                          Buy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Order Book (1 column) */}
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden flex flex-col">
            <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
              <h2 className="text-white text-sm font-semibold">Order Book</h2>
              <p className="text-[#5a7fa0] text-[10px]">Buy / Sell Orders</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3">
                <p className="text-[#4ade80] text-[10px] font-semibold mb-2">BUY ORDERS</p>
                <div className="space-y-1 mb-4">
                  {orderBook.buyOrders.map((order, idx) => (
                    <div key={idx} className="text-[10px]">
                      <div className="flex justify-between text-[#4ade80]">
                        <span>${order.price.toFixed(2)}</span>
                        <span>{order.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[#ef4444] text-[10px] font-semibold mb-2">SELL ORDERS</p>
                <div className="space-y-1">
                  {orderBook.sellOrders.map((order, idx) => (
                    <div key={idx} className="text-[10px]">
                      <div className="flex justify-between text-[#ef4444]">
                        <span>${order.price.toFixed(2)}</span>
                        <span>{order.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades Table */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg overflow-hidden">
          <div className="px-4 pt-4 pb-2 border-b border-[#1e3a5f]/20">
            <h2 className="text-white text-sm font-semibold">Recent Trades</h2>
            <p className="text-[#5a7fa0] text-[10px]">Last 24 hours</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0b1120]/50">
                <tr className="border-b border-[#1e3a5f]/20">
                  <th className="text-left px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Time</th>
                  <th className="text-right px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Tokens</th>
                  <th className="text-right px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Price</th>
                  <th className="text-right px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Total</th>
                  <th className="text-left px-4 py-2 text-[#5a7fa0] text-[10px] font-semibold">Seller</th>
                </tr>
              </thead>
              <tbody>
                {mockTradeHistory.map((trade, idx) => (
                  <tr key={idx} className="border-b border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10">
                    <td className="px-4 py-2 text-white text-[11px]">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="text-right px-4 py-2 text-white text-[11px]">{trade.tokenCount.toLocaleString()}</td>
                    <td className="text-right px-4 py-2 text-white text-[11px]">${trade.pricePerToken.toFixed(2)}</td>
                    <td className="text-right px-4 py-2 text-[#c9a84c] font-bold text-[11px]">
                      ${trade.totalValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-[#8bb8e8] text-[10px] font-mono">{trade.seller.slice(0, 8)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg max-w-md w-full">
            {purchaseStage === 'complete' ? (
              // Success State
              <div className="px-4 pt-4 pb-4">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#4ade80]/20 border border-[#4ade80]/50 flex items-center justify-center">
                      <span className="text-xl text-[#4ade80]">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-bold mb-1">Purchase Successful</h3>
                    <p className="text-[#5a7fa0] text-[10px]">Tokens transferred to wallet</p>
                  </div>
                  <div className="bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2">
                    <a
                      href="https://32f.blockv.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8bb8e8] hover:text-white text-[10px] transition-colors"
                    >
                      View on Blockscout →
                    </a>
                  </div>
                  <button
                    onClick={resetPurchase}
                    className="w-full py-1.5 bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] text-xs font-bold rounded hover:shadow-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              // Purchase Form
              <div className="px-4 pt-4 pb-4 space-y-3">
                <h3 className="text-white text-sm font-bold">Purchase Tokens</h3>

                {purchaseStage === 'idle' ? (
                  <>
                    <div>
                      <label className="block text-[#5a7fa0] text-[10px] mb-1">Your Email</label>
                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-1.5 text-xs text-white placeholder-[#5a7fa0] focus:outline-none focus:border-[#c9a84c]/50"
                      />
                    </div>

                    <div className="bg-[#0b1120] border border-[#1e3a5f]/50 rounded px-3 py-2 space-y-1">
                      {mockListings
                        .filter((l) => l.id === showPurchaseModal)
                        .map((listing) => (
                          <div key={listing.id}>
                            <p className="text-white text-xs font-bold mb-1">{listing.propertyName}</p>
                            <div className="text-[10px] text-[#5a7fa0] space-y-1">
                              <div className="flex justify-between">
                                <span>Tokens:</span>
                                <span className="text-white">{listing.tokenCount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-t border-[#1e3a5f]/20 pt-1">
                                <span>Price/Token:</span>
                                <span className="text-white">${listing.pricePerToken.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-white pt-1">
                                <span>Total:</span>
                                <span>${listing.totalValue.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => resetPurchase()}
                        className="flex-1 py-1.5 bg-[#0b1120] border border-[#1e3a5f]/50 text-white text-xs rounded hover:border-[#1e3a5f] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePurchase(showPurchaseModal)}
                        disabled={purchasing || !buyerEmail}
                        className="flex-1 py-1.5 bg-gradient-to-r from-[#c9a84c] to-[#a68832] text-[#0b1120] text-xs font-bold rounded hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {purchasing ? 'Processing...' : 'Settle On-Chain'}
                      </button>
                    </div>
                  </>
                ) : (
                  // Settlement Animation
                  <div className="space-y-3 py-2">
                    {/* Stage 1: Settling */}
                    <div className="flex items-center gap-2">
                      {purchaseStage === 'settling' ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#c9a84c] border-t-transparent animate-spin" />
                      ) : (
                        <span className="text-[#4ade80] text-sm">✓</span>
                      )}
                      <span
                        className={`text-xs font-medium ${
                          purchaseStage === 'settling'
                            ? 'text-[#c9a84c]'
                            : 'text-[#4ade80]'
                        }`}
                      >
                        Settling Transaction
                      </span>
                    </div>

                    {/* Stage 2: Confirming */}
                    <div className="flex items-center gap-2">
                      {purchaseStage === 'confirming' ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#c9a84c] border-t-transparent animate-spin" />
                      ) : purchaseStage === 'settling' ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#1e3a5f]/50" />
                      ) : (
                        <span className="text-[#4ade80] text-sm">✓</span>
                      )}
                      <span
                        className={`text-xs font-medium ${
                          purchaseStage === 'confirming'
                            ? 'text-[#c9a84c]'
                            : purchaseStage === 'settling'
                            ? 'text-[#5a7fa0]'
                            : 'text-[#4ade80]'
                        }`}
                      >
                        Confirming on Chain
                      </span>
                    </div>

                    <div className="bg-[#0b1120] rounded px-3 py-1.5 text-center">
                      <p className="text-[10px] text-[#5a7fa0]">Settlement in progress...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
