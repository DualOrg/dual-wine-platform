# QR-Code-to-Wallet Demo Flow Implementation

This document describes the complete QR-code-to-wallet demo flow for investor presentations on the DUAL Wine Platform.

## Architecture Overview

The system consists of:
1. **Session-Based Guest Wallet** — Server-side cookie storage for claimed wine tokens
2. **QR Code Generation** — Dynamic QR codes linking to claim pages
3. **Claim Flow** — Beautiful, animated landing page when scanning QR codes
4. **Demo Presenter Page** — Full-screen dashboard showing all 10 wine tokens
5. **Updated Wallet** — Displays only claimed wines instead of hardcoded owner filter

## Core Components

### 1. Session Wallet API Routes

#### `src/app/api/wallet/route.ts`
- **GET**: Returns `{ claimedIds: string[] }` from the `dual_wallet` HTTP-only cookie
- **DELETE**: Clears the wallet by deleting the cookie
- Uses server-side cookies (no localStorage) for security

#### `src/app/api/wallet/claim/route.ts`
- **POST**: Accepts `{ objectId: string }`
- Adds the objectId to the claimed wines list
- Persists to HTTP-only cookie with 30-day expiration
- Returns `{ success: true, claimedIds: string[] }`

### 2. QR Code Generation

#### `src/app/api/qr/[objectId]/route.ts`
- Generates PNG QR codes on-demand
- Encodes URL: `{SITE_URL}/claim/{objectId}`
- Returns cached (3600s) PNG image response
- Uses the `qrcode` npm package
- Wine-950 (dark) color for brand consistency

**Environment Variable:**
```
NEXT_PUBLIC_SITE_URL=https://dual-wine-platform.vercel.app
```

### 3. Claim Page

#### `src/app/claim/[objectId]/page.tsx`
**Phases:**
1. **Verifying** (2s) — Shows spinner with "Verifying token on DUAL Network..."
2. **Info** — Displays wine token details (name, producer, vintage, content hash, value)
3. **Claiming** — Animated processing spinner
4. **Success** — Confetti animation + "View in Wallet" button
5. **Already Claimed** — Shows "Already in your wallet" with link to /wallet
6. **Error** — Shows error message with retry option

**Design:**
- Dark wine-950 gradient background with gold accents
- Premium, magical animations
- Responsive on mobile (main demo use case)
- No navigation bar — standalone experience
- DUAL branding and "Powered by DUAL Network" footer

### 4. Demo Presenter Page

#### `src/app/demo/page.tsx`
**Features:**
- Full-screen dashboard for investor pitches
- Displays all 10 wine tokens in a responsive grid (2 cols tablet, 3-4 cols desktop)
- Each card shows:
  - QR code (loaded from `/api/qr/{objectId}`)
  - Wine name and ANCHORED badge
  - Token ID (truncated)
  - Content hash (truncated)
  - Wine type and current value badges
- Header with "DUAL Wine Provenance — Live Demo"
- Instructions: "Scan any QR code with your phone to claim a wine token"
- "Reset All Claims" button for demos
- Stats bar: "10 tokens | DUAL Network | Blockscout Verified"
- Dark slate-900 professional theme with gold/wine accents

### 5. Updated Wallet Page

#### `src/app/(consumer)/wallet/page.tsx` (modified)
**Changes:**
- Fetches claimed wine IDs from `/api/wallet`
- Filters wines from `/api/wines` to only show claimed ones
- Shows empty state when no wines claimed:
  - Icon + "No wines in your cellar yet"
  - Link: "Scan a QR code to claim a wine"
- All existing portfolio summary, filters, and detailed wine views work unchanged

### 6. Scan Page Enhancement

#### `src/app/(consumer)/wallet/scan/page.tsx` (modified)
**New Feature:**
- Detects claim URLs in scanned QR codes
- Pattern: `/claim/{objectId}`
- Redirects directly to claim page instead of verification flow
- Old verification flow still works for other QR codes

## Session Wallet Utility

#### `src/lib/session-wallet.ts`
TypeScript utility module for client-side wallet management:
- `getClaimedWines()` — Fetch claimed IDs
- `claimWine(objectId)` — Claim a wine
- `isWineClaimed(objectId)` — Check if claimed
- `clearWallet()` — Clear all claims

## Data Flow

### Claiming a Wine Token

```
1. User scans QR code with phone
   └─ QR encodes: https://dual-wine-platform.vercel.app/claim/{objectId}

2. Browser navigates to /claim/{objectId}
   ├─ Fetches wine data from /api/wines/{objectId}
   ├─ Checks if already claimed via GET /api/wallet
   └─ Shows appropriate phase (info, already_claimed, etc.)

3. User taps "Claim to Wallet"
   ├─ POST /api/wallet/claim { objectId }
   ├─ Server adds to dual_wallet cookie
   ├─ Shows success animation
   └─ "View in Wallet" button redirects to /wallet

4. On /wallet
   ├─ Fetches claimed IDs from GET /api/wallet
   ├─ Fetches all wines from GET /api/wines
   ├─ Filters wines array to only claimed ones
   └─ Displays portfolio summary + wine list
```

## TypeScript Strict Mode

All code is written with strict TypeScript typing:
- Explicit parameter types on all functions
- Proper return type annotations
- Interface definitions for API responses
- Callback function signatures fully typed
- Error handling with `unknown` type safety

## Styling & Theme

**Colors:**
- `wine-950`: Dark wine background (#440a1d)
- `wine-gradient`: Linear gradient for premium feel
- `gold-500`/`gold-gradient`: Accent colors
- `slate-900`: Professional dashboard backgrounds

**Custom CSS Classes** (in `src/app/globals.css`):
```css
.wine-gradient { background: linear-gradient(135deg, #791b3a 0%, #912448 50%, #4d0d22 100%); }
.gold-gradient { background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); }
```

**Icons:**
- Material Symbols Outlined (already configured)
- `wine_bar`, `verified`, `check_circle`, `qr_code`, etc.

## Dependencies

Added to `package.json`:
```json
{
  "dependencies": {
    "qrcode": "^1.5.3"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.2"
  }
}
```

## Build Status

✓ All files compile successfully with TypeScript strict mode
✓ No type errors
✓ Production-ready build verification passed

## Files Created/Modified

### New Files
- `src/app/api/wallet/route.ts` — Session wallet API (GET/DELETE)
- `src/app/api/wallet/claim/route.ts` — Claim endpoint
- `src/app/api/qr/[objectId]/route.ts` — QR code generation
- `src/app/claim/[objectId]/page.tsx` — Claim flow with animations
- `src/app/demo/page.tsx` — Presenter dashboard
- `src/lib/session-wallet.ts` — Utility module

### Modified Files
- `package.json` — Added qrcode dependencies
- `src/app/(consumer)/wallet/page.tsx` — Updated to use session wallet
- `src/app/(consumer)/wallet/scan/page.tsx` — Added claim URL detection

## Testing the Flow

### Local Demo
1. Start dev server: `npm run dev`
2. Navigate to `/demo` in browser
3. Desktop: Right-click QR code → "Open in new tab" (shows it's a real URL)
4. Mobile: Scan QR code with phone camera, or use a QR scanner app
5. Claims persist across page reloads (via cookie)
6. View claimed wines in `/wallet`
7. Test with multiple wines to build a portfolio

### Reset for Fresh Demo
- Use "Reset All Claims" button on `/demo` page
- Or manually delete `dual_wallet` cookie in DevTools

## Security Considerations

- ✓ HTTP-only cookies prevent XSS access
- ✓ QR codes expire after 3600 seconds in cache
- ✓ No sensitive data in URLs
- ✓ Claims are session-based (can implement user authentication later)
- ✓ CSRF protection via Next.js built-in SameSite defaults

## Future Enhancements

1. **User Authentication** — Replace session wallet with user-owned wallets
2. **Blockchain Integration** — Store claims on DUAL Network instead of cookies
3. **NFT Metadata** — Display full wine metadata from smart contracts
4. **Transfer/Trade** — Allow users to transfer claimed wines
5. **Real Mint/Burn** — Replace simulated claiming with actual blockchain transactions
