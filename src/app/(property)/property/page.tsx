'use client';

import { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════
   DATA — matches the Stitch design screenshot exactly
   ═══════════════════════════════════════════════════════════ */

const PROPERTIES = [
  { name: 'Luxecréston',   totalVal: 10_000_000, annualYield: 3.88, tokenPrice: 1_250, riskScore: 23 },
  { name: 'Property 1',    totalVal:  7_500_000, annualYield: 5.85, tokenPrice: 1_250, riskScore: 26 },
  { name: 'Property 2',    totalVal: 18_000_000, annualYield: 3.98, tokenPrice: 1_250, riskScore: 30 },
  { name: 'Camberview',    totalVal: 10_000_000, annualYield: 3.98, tokenPrice: 1_250, riskScore: 34 },
  { name: 'Property 3',    totalVal:  5_000_000, annualYield: 3.02, tokenPrice: 1_250, riskScore: 22 },
  { name: 'Property 4',    totalVal:  7_000_000, annualYield: 3.76, tokenPrice: 1_250, riskScore: 18 },
];

const MARKET_DEPTH = [
  { qty: 50,  price: 1_250 },
  { qty: 30,  price: 1_250 },
  { qty: 100, price: 1_250 },
  { qty: 45,  price: 1_250 },
  { qty: 20,  price: 1_700 },
];

const ASSET_SPECS: [string, string][] = [
  ['Property',               'Location: Fox Records\nComponent'],
  ['Total Valuation',        '3,001'],
  ['Annual Yield Volatility', '90.88%'],
  ['Annual Yield',           '3.36%'],
  ['Token Price',            '$1,250'],
  ['Risk Score',             '5'],
  ['Property Comparative',   '0.65'],
];

const CONTRACT_DETAILS: { label: string; value: string; isLink?: boolean; mono?: boolean }[] = [
  { label: 'Contract Name',     value: 'cdwartz' },
  { label: '',                   value: 'https://www.finance.com/fullstgproperties', isLink: true },
  { label: 'Contract Number',   value: '26378213', mono: true },
  { label: 'Contract Platform', value: '0x31950717B4e3233', mono: true },
  { label: 'Network',           value: '0x9f7e93a2e1bba049c4a39345b5—\n0x66f0c1043a84e71a3fe5cff17f3db5ef5fff00—\n4473b9325', mono: true },
];

/* ═══════════════════════════════════════════════════════════
   CHART DATA GENERATORS
   ═══════════════════════════════════════════════════════════ */

function makeTokenPrices(): number[] {
  const pts: number[] = [];
  let p = 650;
  for (let i = 0; i < 84; i++) {
    p += (Math.random() - 0.44) * 50;
    p = Math.max(400, Math.min(1500, p));
    pts.push(Math.round(p));
  }
  // Pull last segment towards ~$1,250
  for (let i = 60; i < 84; i++) {
    pts[i] = 900 + Math.round(Math.random() * 400);
  }
  return pts;
}

function makeYieldData(): { total: number; pct: number }[] {
  return [2019, 2020, 2021, 2022, 2023, 2024, 2025].map((_, i) => ({
    total: 180_000 + i * 90_000 + Math.round(Math.random() * 50_000),
    pct:   3 + Math.random() * 4,
  }));
}

/* ═══════════════════════════════════════════════════════════
   CANVAS RENDERERS
   ═══════════════════════════════════════════════════════════ */

function renderLineChart(cvs: HTMLCanvasElement, data: number[]) {
  const ctx = cvs.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const { width: w, height: h } = cvs.getBoundingClientRect();
  cvs.width  = w * dpr;
  cvs.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const L = 48, R = 8, T = 8, B = 22;
  const cw = w - L - R, ch = h - T - B;
  const mn = Math.min(...data) - 80;
  const mx = Math.max(...data) + 80;
  const rng = mx - mn;

  // grid
  ctx.strokeStyle = '#1e3a5f30';
  ctx.lineWidth = 0.5;
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillStyle = '#5a7fa0';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const y = T + ch - (ch / 5) * i;
    const v = mn + (rng / 5) * i;
    ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + cw, y); ctx.stroke();
    ctx.fillText('$' + Math.round(v).toLocaleString(), L - 6, y + 3);
  }
  // x labels
  const xlbl = ['2019','2020','2021','2022','2023','2024','2025'];
  ctx.textAlign = 'center';
  for (let i = 0; i < xlbl.length; i++) {
    ctx.fillText(xlbl[i], L + (cw / (xlbl.length - 1)) * i, h - 4);
  }

  // area
  ctx.beginPath();
  ctx.moveTo(L, T + ch);
  for (let i = 0; i < data.length; i++) {
    ctx.lineTo(L + (cw / (data.length - 1)) * i, T + ch - ((data[i] - mn) / rng) * ch);
  }
  ctx.lineTo(L + cw, T + ch);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, T, 0, T + ch);
  g.addColorStop(0, 'rgba(201,168,76,0.25)');
  g.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.fillStyle = g;
  ctx.fill();

  // line
  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = L + (cw / (data.length - 1)) * i;
    const y = T + ch - ((data[i] - mn) / rng) * ch;
    if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
  }
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function renderBarLineChart(cvs: HTMLCanvasElement, bars: number[], line: number[]) {
  const ctx = cvs.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const { width: w, height: h } = cvs.getBoundingClientRect();
  cvs.width  = w * dpr;
  cvs.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const L = 48, R = 40, T = 8, B = 22;
  const cw = w - L - R, ch = h - T - B;
  const mxBar = Math.max(...bars) * 1.25;
  const mxLine = Math.max(...line) * 1.4;
  const n = bars.length;
  const bw = (cw / n) * 0.55;

  // grid
  ctx.strokeStyle = '#1e3a5f25';
  ctx.lineWidth = 0.5;
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillStyle = '#5a7fa0';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = T + ch - (ch / 4) * i;
    const v = (mxBar / 4) * i;
    ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + cw, y); ctx.stroke();
    ctx.fillText('$' + (v / 1000).toFixed(0) + 'k', L - 6, y + 3);
  }
  // right axis
  ctx.textAlign = 'left';
  for (let i = 0; i <= 4; i++) {
    const y = T + ch - (ch / 4) * i;
    ctx.fillText(((mxLine / 4) * i).toFixed(1) + '%', L + cw + 6, y + 3);
  }
  // x labels
  const xlbl = ['2019','2020','2021','2022','2023','2024','2025'];
  ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) {
    const cx = L + (cw / n) * i + (cw / n) / 2;
    ctx.fillText(xlbl[i], cx, h - 4);
  }

  // bars
  for (let i = 0; i < n; i++) {
    const bh = (bars[i] / mxBar) * ch;
    const x = L + (cw / n) * i + ((cw / n) - bw) / 2;
    const y = T + ch - bh;
    const g = ctx.createLinearGradient(x, y, x, T + ch);
    g.addColorStop(0, '#c9a84c');
    g.addColorStop(1, '#8b6f2a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, [3, 3, 0, 0]);
    ctx.fill();
  }

  // line
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const cx = L + (cw / n) * i + (cw / n) / 2;
    const y = T + ch - (line[i] / mxLine) * ch;
    if (i === 0) { ctx.moveTo(cx, y); } else { ctx.lineTo(cx, y); }
  }
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // dots
  for (let i = 0; i < n; i++) {
    const cx = L + (cw / n) * i + (cw / n) / 2;
    const y = T + ch - (line[i] / mxLine) * ch;
    ctx.beginPath(); ctx.arc(cx, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#4ade80'; ctx.fill();
  }
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function PropertyDashboard() {
  const lineRef = useRef<HTMLCanvasElement>(null);
  const barRef  = useRef<HTMLCanvasElement>(null);

  const [prices]    = useState(makeTokenPrices);
  const [yieldData] = useState(makeYieldData);
  const [filter, setFilter] = useState('');
  const [buyQty, setBuyQty] = useState(1);

  const draw = () => {
    if (lineRef.current) renderLineChart(lineRef.current, prices);
    if (barRef.current)  renderBarLineChart(barRef.current, yieldData.map(d => d.total), yieldData.map(d => d.pct));
  };

  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  });

  const currentPrice = 1_250;
  const filtered = PROPERTIES.filter(p => !filter || p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-5 space-y-4">

      {/* ────────────────── ROW 1 ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Historical Token Price */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-[13px] font-semibold text-white">Historical Token Price</h3>
            <p className="text-[10px] text-[#5a7fa0]">Price / Token price (time-series)</p>
          </div>
          <div className="px-4 pb-1 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-[#c9a84c] inline-block rounded" />
            <span className="text-[9px] text-[#c9a84c]">Token Price</span>
          </div>
          <div className="px-2 pb-3">
            <canvas ref={lineRef} className="w-full" style={{ height: 190 }} />
          </div>
        </div>

        {/* Dynamic Yield Projection */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-[13px] font-semibold text-white">Dynamic Yield Projection</h3>
            <p className="text-[10px] text-[#5a7fa0]">Projected annual yield (bar-overview)</p>
          </div>
          <div className="px-4 pb-1 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#c9a84c] inline-block rounded-sm" />
              <span className="text-[9px] text-[#c9a84c]">Annual Yield</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-[2px] bg-[#4ade80] inline-block rounded" />
              <span className="text-[9px] text-[#4ade80]">Annual Yield</span>
            </span>
          </div>
          <div className="px-2 pb-3">
            <canvas ref={barRef} className="w-full" style={{ height: 190 }} />
          </div>
        </div>

        {/* Property Comparative Table */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-[13px] font-semibold text-white">Property Comparative Table</h3>
          </div>
          <div className="px-4 pb-2">
            <input
              type="text"
              placeholder="Filter..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full bg-[#0b1120] border border-[#1e3a5f]/40 rounded px-2.5 py-1 text-[10px] text-white placeholder-[#5a7fa0]/60 focus:outline-none focus:border-[#c9a84c]/40"
            />
          </div>
          <div className="px-4 pb-3 overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-[#1e3a5f]/30">
                  <th className="text-left py-1 font-medium text-[#5a7fa0]">Location</th>
                  <th className="text-right py-1 font-medium text-[#5a7fa0]">Total Valuation</th>
                  <th className="text-right py-1 font-medium text-[#5a7fa0]">Annual Yield</th>
                  <th className="text-right py-1 font-medium text-[#5a7fa0]">Token Price</th>
                  <th className="text-right py-1 font-medium text-[#5a7fa0]">Risk<br/>Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={i} className="border-b border-[#1e3a5f]/15 hover:bg-[#1e3a5f]/10 transition-colors">
                    <td className="py-1.5 text-[#8bb8e8]">{p.name}</td>
                    <td className="py-1.5 text-right text-white">${p.totalVal.toLocaleString()}</td>
                    <td className="py-1.5 text-right text-[#4ade80]">{p.annualYield.toFixed(2)}%</td>
                    <td className="py-1.5 text-right text-white">${p.tokenPrice.toLocaleString()}</td>
                    <td className="py-1.5 text-right">
                      <span className={`inline-block min-w-[24px] text-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        p.riskScore < 24 ? 'bg-[#4ade80]/15 text-[#4ade80]'
                        : p.riskScore < 31 ? 'bg-[#c9a84c]/15 text-[#c9a84c]'
                        : 'bg-[#f97316]/15 text-[#f97316]'
                      }`}>{p.riskScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ────────────────── ROW 2 ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Asset Specifications & Risk Metrics */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-[13px] font-semibold text-white">Asset Specifications &amp; Risk Metrics</h3>
            <p className="text-[10px] text-[#5a7fa0]">Asset Specifications &amp; Risk Metrics</p>
          </div>
          <div className="px-4 pb-3">
            <table className="w-full text-[11px]">
              <tbody>
                {ASSET_SPECS.map(([label, value], i) => (
                  <tr key={i} className="border-b border-[#1e3a5f]/15">
                    <td className="py-1.5 text-[#5a7fa0] pr-2 align-top">{label}</td>
                    <td className="py-1.5 text-right text-white font-medium whitespace-pre-line">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Contract Details & Network */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-[13px] font-semibold text-white">Smart Contract Details &amp; Network</h3>
            <p className="text-[10px] text-[#5a7fa0]">Smart Contract Details &amp; Network</p>
          </div>
          <div className="px-4 pb-3">
            <table className="w-full text-[11px]">
              <tbody>
                {CONTRACT_DETAILS.map((row, i) => (
                  <tr key={i} className="border-b border-[#1e3a5f]/15">
                    {row.label ? (
                      <td className="py-1.5 text-[#5a7fa0] pr-2 align-top">{row.label}</td>
                    ) : (
                      <td className="py-1.5 text-[#5a7fa0] pr-2 align-top">Explorer</td>
                    )}
                    <td className={`py-1.5 text-right align-top ${row.mono ? 'font-mono text-[9px]' : ''}`}>
                      {row.isLink ? (
                        <a href={row.value} target="_blank" rel="noopener noreferrer"
                           className="text-[#8bb8e8] hover:underline text-[9px] break-all">
                          {row.value.replace('https://www.', '')}
                        </a>
                      ) : (
                        <span className="text-white whitespace-pre-line break-all">{row.value}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market Depth */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-[13px] font-semibold text-white">Market Depth</h3>
            <p className="text-[10px] text-[#5a7fa0]">Market Depth in inherit Sessions</p>
          </div>
          <div className="px-4 pb-3">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#1e3a5f]/30">
                  <th className="text-left py-1 font-medium text-[#5a7fa0] text-[10px]">Quantity</th>
                  <th className="text-right py-1 font-medium text-[#5a7fa0] text-[10px]">Insert Price</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_DEPTH.map((row, i) => (
                  <tr key={i} className="border-b border-[#1e3a5f]/15">
                    <td className="py-1.5 text-white">{row.qty}</td>
                    <td className="py-1.5 text-right text-white">${row.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buy Tokens */}
        <div className="bg-[#0f1b2e] border border-[#1e3a5f]/50 rounded-lg">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-[13px] font-semibold text-white">Buy Tokens</h3>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5a7fa0]">Current Price:</span>
                <span className="text-white font-semibold">${currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5a7fa0]">Available:</span>
                <span className="text-white">16,500</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#5a7fa0] block mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={buyQty}
                onChange={e => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#0b1120] border border-[#1e3a5f]/40 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9a84c]/40"
              />
            </div>

            <div className="flex justify-between text-[11px] border-t border-[#1e3a5f]/25 pt-2">
              <span className="text-[#5a7fa0]">Total:</span>
              <span className="text-white font-semibold">${(currentPrice * buyQty).toLocaleString()}</span>
            </div>

            <button className="w-full bg-gradient-to-r from-[#c9a84c] to-[#a68832] hover:from-[#d4b55a] hover:to-[#b89840] text-[#0b1120] font-bold text-xs py-2.5 rounded transition-all shadow-lg shadow-[#c9a84c]/15">
              BUY TOKENS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
