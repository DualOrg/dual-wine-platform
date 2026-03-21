'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Intelligence", icon: "auto_awesome", filled: true },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory_2", filled: false },
  { href: "/admin/mint", label: "Mint", icon: "database", filled: false },
  { href: "/admin/webhooks", label: "Webhooks", icon: "settings_input_component", filled: false },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-20 h-screen bg-burgundy-deep flex flex-col items-center py-8 border-r border-white/10 z-50 sticky top-0">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-10 h-10 rounded-full bg-gold-primary flex items-center justify-center font-extrabold text-burgundy-deep text-sm">
          V
        </div>
      </div>

      {/* Nav icons */}
      <nav className="flex-1 space-y-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                active
                  ? "text-gold-dim bg-white/5"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active && item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Consumer app link */}
      <div className="mt-auto space-y-4">
        <Link
          href="/wallet"
          title="Consumer App"
          className="flex items-center justify-center w-12 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className="material-symbols-outlined">open_in_new</span>
        </Link>
        <div className="w-10 h-10 rounded-full border border-gold-dim/30 bg-burgundy-accent flex items-center justify-center text-gold-dim text-xs font-bold">
          AD
        </div>
      </div>
    </aside>
  );
}
