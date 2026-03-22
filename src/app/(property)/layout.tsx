'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0b1120]/95 backdrop-blur-xl border-b border-[#1e3a5f]/40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/property" className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-wide">
                DUAL
              </span>
              <span className="text-lg font-light text-[#8bb8e8]">
                Properties
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/property"
                className="text-sm text-[#8bb8e8] hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/property/portfolio"
                className="text-sm text-[#8bb8e8] hover:text-white transition-colors"
              >
                Properties
              </Link>
              <Link
                href="/property/trade"
                className="text-sm text-[#8bb8e8] hover:text-white transition-colors"
              >
                Financial Alerts
              </Link>
              <Link
                href="/property/distribute"
                className="text-sm text-[#8bb8e8] hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Log In */}
            <div className="hidden md:block">
              <Link
                href="/admin"
                className="text-sm text-[#8bb8e8] hover:text-white transition-colors"
              >
                Log In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-white/[0.08] rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-5 h-5 text-[#8bb8e8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-[#1e3a5f]/40 pt-4 space-y-2">
              <Link
                href="/property"
                className="block text-sm text-[#8bb8e8] hover:text-white px-4 py-2 rounded hover:bg-white/5"
              >
                Home
              </Link>
              <Link
                href="/property/portfolio"
                className="block text-sm text-[#8bb8e8] hover:text-white px-4 py-2 rounded hover:bg-white/5"
              >
                Properties
              </Link>
              <Link
                href="/property/trade"
                className="block text-sm text-[#8bb8e8] hover:text-white px-4 py-2 rounded hover:bg-white/5"
              >
                Financial Alerts
              </Link>
              <Link
                href="/property/distribute"
                className="block text-sm text-[#8bb8e8] hover:text-white px-4 py-2 rounded hover:bg-white/5"
              >
                Contact
              </Link>
              <Link
                href="/admin"
                className="block text-sm text-[#8bb8e8] hover:text-white px-4 py-2 rounded hover:bg-white/5"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-0">{children}</main>
    </div>
  );
}
