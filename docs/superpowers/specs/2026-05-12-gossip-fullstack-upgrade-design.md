# GOSSIP Full-Stack Upgrade Design

## Date: 2026-05-12

## Overview
Transform GOSSIP from a mock UI showcase into a fully functional dApp with complete Solana program integration, real trading flow, agent deployment, and production-ready UX.

---

## Part 1: Solana Program Enhancements

### 1.1 New Instructions

#### `settle_position`
```rust
pub fn settle_position(ctx: Context<SettlePosition>, market_title: String) -> Result<()> {
    // Calculate payout based on Gaussian density at prediction point
    // Transfer winnings from market vault to user
    // Mark prediction as settled
}
```

#### `update_market`
```rust
pub fn update_market(ctx: Context<UpdateMarket>, new_mu: f64, new_sigma: f64) -> Result<()> {
    // Oracle-only instruction to update market parameters
    // Used for time-decay or external data feeds
}
```

#### `create_market` Updates
- Add `category`, `resolution_source`, `ends_at` parameters
- Add `creator` field for royalty tracking

### 1.2 Account Schema Updates

```rust
#[account]
pub struct Market {
    pub authority: Pubkey,
    pub creator: Pubkey,           // NEW: market creator
    pub title: String,
    pub category: String,           // NEW: "Crypto", "Weather", etc.
    pub mu: f64,
    pub sigma: f64,
    pub b: f64,
    pub total_liquidity: u64,
    pub resolved: bool,
    pub final_outcome: f64,
    pub resolution_source: String,  // NEW: oracle info
    pub ends_at: i64,               // NEW: resolution timestamp
}

#[account]
pub struct Prediction {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub point: f64,
    pub amount: u64,
    pub initial_mu: f64,
    pub initial_sigma: f64,
    pub created_at: i64,            // NEW: timestamp
    pub settled: bool,              // NEW: settlement status
    pub payout: u64,                // NEW: calculated payout
}
```

### 1.3 P&L Calculation

```rust
fn calculate_payout(prediction: &Prediction, final_outcome: f64) -> u64 {
    let z_score = (final_outcome - prediction.initial_mu) / prediction.initial_sigma;
    let density = (1.0 / (prediction.initial_sigma * (2.0 * std::f64::consts::PI).sqrt())) 
        * (-0.5 * z_score.powi(2)).exp();
    let multiplier = density * 100000.0; // Scale for usability
    (prediction.amount as f64 * multiplier) as u64
}
```

### 1.4 Error Codes

```rust
#[error_code]
pub enum GossipError {
    #[msg("Market is already resolved")]
    AlreadyResolved,
    #[msg("Market has not been resolved yet")]
    NotResolved,
    #[msg("Position already settled")]
    AlreadySettled,
    #[msg("Prediction not found")]
    PredictionNotFound,
    #[msg("Invalid market parameters")]
    InvalidParams,
}
```

---

## Part 2: Web App - Data Layer

### 2.1 Custom Hooks

#### `useMarketData`
```typescript
interface MarketData {
  mu: number;
  sigma: number;
  totalLiquidity: number;
  resolved: boolean;
  finalOutcome?: number;
  endsAt: number;
}

function useMarketData(marketTitle: string): {
  data: MarketData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

#### `useUserPositions`
```typescript
interface Position {
  marketTitle: string;
  point: number;
  amount: number;
  initialMu: number;
  initialSigma: number;
  settled: boolean;
  payout: number;
  createdAt: number;
}

function useUserPositions(): {
  positions: Position[];
  loading: boolean;
  refetch: () => void;
}
```

#### `useWalletBalance`
```typescript
function useWalletBalance(): {
  balance: number; // in CASH
  solBalance: number;
  loading: boolean;
}
```

### 2.2 Program Integration

```typescript
const PROGRAM_ID = new PublicKey('9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi');

const marketSeeds = [Buffer.from('market'), Buffer.from(title)];
const [marketPda] = PublicKey.findProgramAddressSync(marketSeeds, programId);

const predictionSeeds = [
  Buffer.from('prediction'),
  marketPda.toBuffer(),
  userPubkey.toBuffer(),
];
const [predictionPda] = PublicKey.findProgramAddressSync(predictionSeeds, programId);
```

---

## Part 3: Web App - Trading Flow

### 3.1 Trading Modal

**Trigger:** User clicks "Place Prediction" on market detail page

**Flow:**
1. Show confirmation modal with:
   - Prediction value (editable)
   - Stake amount (editable)
   - Implied multiplier
   - Potential payout
   - Network fee estimate
   - "Confirm" / "Cancel" buttons
2. On confirm: execute transaction
3. Show loading state with spinner
4. On success: show toast + update market data
5. On failure: show error toast with retry option

### 3.2 Transaction Toast System

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  txLink?: string; // Solana Explorer link
  duration?: number;
}

// Auto-dismiss after 5s for success, manual dismiss for error
```

### 3.3 Error Handling

| Error Type | Handling |
|------------|----------|
| Wallet not connected | Show "Connect Wallet" modal |
| Insufficient balance | Show warning, suggest amount |
| Transaction rejected | Show retry button |
| Network error | Show "Try Again" with exponential backoff |
| Program error | Show specific error message |

---

## Part 4: Pages Enhancement

### 4.1 Markets Page

**Current:** Static grid with hardcoded data

**Enhanced:**
- Live search with 300ms debounce
- Category filter (Crypto, Finance, Weather, Macro, AI)
- Sort by: Volume, Liquidity, Ending Soon
- Pull-to-refresh on mobile
- "Create Market" CTA (for users with governance token)

```typescript
// Filter implementation
const filteredMarkets = markets.filter(m => 
  (!category || m.category === category) &&
  (!searchTerm || m.title.toLowerCase().includes(searchTerm.toLowerCase()))
);
```

### 4.2 Market Detail Page

**Current:** Basic trading panel with mock data

**Enhanced:**
- Real μ/σ from program
- Live participant count
- Your position indicator on chart
- "Close Position" button (before resolution)
- Share market link (generate solana: action URL)

### 4.3 Portfolio Page

**Current:** Static positions table

**Enhanced:**
- Fetch real positions from program
- P&L calculation: `(current_multiplier - 1) * stake`
- Color indicators: green for profit, red for loss
- "Settled" badge for resolved positions
- Close position functionality
- Export to CSV button

```typescript
const calculatePnL = (position: Position, currentMu: number): number => {
  const zScore = (currentMu - position.initialMu) / position.initialSigma;
  const currentMultiplier = (1 / (position.initialSigma * Math.sqrt(2 * Math.PI))) 
    * Math.exp(-0.5 * Math.pow(zScore, 2)) * 100000;
  return (currentMultiplier - 1) * position.amount;
};
```

### 4.4 Agents Page

**Current:** Static leaderboard

**Enhanced:**
- Deploy Agent Wizard:
  1. Upload model (PyTorch .pt file)
  2. Configure parameters (budget, risk level, strategies)
  3. Generate MCP config (JSON output)
  4. Display Swig wallet connection
- Agent status: Active/Paused/Stopped
- Real-time P&L per agent
- "Stop" / "Pause" / "Resume" controls

---

## Part 5: UI/UX Enhancements

### 5.1 Global Components

#### Skeleton Loaders
- Replace spinners with skeleton blocks
- Match content shape (table row, card, chart area)
- Subtle pulse animation

#### Empty States
- Illustrated empty states for:
  - No markets found (after filter)
  - No positions yet
  - No agents deployed

#### Page Transitions
- Fade + slide animations between pages
- Stagger children elements on page load

### 5.2 Mobile Optimizations

- Bottom sheet modals for trading
- Touch-optimized input fields (larger tap targets)
- Swipe gestures for category filter
- Responsive chart that fits viewport
- Pull-to-refresh

### 5.3 Animations

| Element | Animation |
|---------|-----------|
| Stats counters | Count up from 0 on load |
| Market cards | Stagger fade-in on scroll |
| Buttons | Scale + glow on hover |
| Charts | Draw path animation on mount |
| Toast notifications | Slide in from top-right |

---

## Part 6: Integration Points

### 6.1 Solana Actions / Blinks

```typescript
// /api/actions/gossip/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const marketId = url.searchParams.get('market');
  
  return Response.json({
    title: `GOSSIP: ${marketId}`,
    icon: 'https://.../gossip-icon.png',
    actions: [
      {
        label: 'Place Prediction',
        href: `/market/${marketId}?action=bet`,
      },
    ],
  });
}
```

### 6.2 MCP Server Integration

```typescript
// Agent uses MCP to query market state
{
  tool: 'get_market_state',
  arguments: { marketTitle: 'SOL Price' }
}

// Returns: { mu: 198.42, sigma: 24.5, liquidity: 124500 }
```

### 6.3 Oracle Node

```typescript
// Oracle resolves market
await program.methods
  .resolveMarket(finalOutcome)
  .accounts({
    market: marketPda,
    authority: oracleAuthority,
  })
  .rpc();

// Then settle all positions
for (const position of positions) {
  await program.methods
    .settlePosition(position.marketTitle)
    .accounts({ ... })
    .rpc();
}
```

---

## Implementation Notes

- Keep devnet as default network
- All monetary values stored as integers (lamports-like)
- Timestamps in unix seconds
- Use Anchor's `init_if_needed` for prediction accounts
- Maintain backward compatibility with existing markets

---

## Testing Strategy

1. **Unit tests** — Program instructions (existing + new)
2. **Integration tests** — Web hooks with local validator
3. **E2E tests** — Full user flow: connect → browse → trade → view portfolio

---

## Success Criteria

- [ ] All program instructions work on devnet
- [ ] Web app loads real market data from program
- [ ] Trading flow completes successfully
- [ ] Portfolio shows user's real positions
- [ ] Mobile experience is smooth
- [ ] No console errors in production build