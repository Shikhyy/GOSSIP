# GOSSIP Full-Stack Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform GOSSIP into a fully functional dApp with complete Solana program integration, real trading flow, and production-ready UX.

**Architecture:** Hybrid approach - web app pulls live data from Solana program with graceful fallback to demo data. Program extended with settlement logic and account fields. Web app uses custom hooks for data fetching with optimistic UI updates.

**Tech Stack:** Anchor (Solana), Next.js 16, React 19, Framer Motion, @solana/web3.js, @coral-xyz/anchor

---

## Phase 1: Solana Program Enhancements

### Task 1: Update Program Account Schemas

**Files:**
- Modify: `program/programs/program/src/lib.rs:123-143`

- [ ] **Step 1: Update Market account struct**

```rust
#[account]
pub struct Market {
    pub authority: Pubkey,
    pub creator: Pubkey,              // NEW
    pub title: String,
    pub category: String,             // NEW
    pub mu: f64,
    pub sigma: f64,
    pub b: f64,
    pub total_liquidity: u64,
    pub resolved: bool,
    pub final_outcome: f64,
    pub resolution_source: String,    // NEW
    pub ends_at: i64,                 // NEW
}
```

- [ ] **Step 2: Update Prediction account struct**

```rust
#[account]
pub struct Prediction {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub point: f64,
    pub amount: u64,
    pub initial_mu: f64,
    pub initial_sigma: f64,
    pub created_at: i64,              // NEW
    pub settled: bool,                // NEW
    pub payout: u64,                  // NEW
}
```

- [ ] **Step 3: Commit**

```bash
git add program/programs/program/src/lib.rs
git commit -m "feat: update account schemas with new fields"
```

---

### Task 2: Add New Error Codes

**Files:**
- Modify: `program/programs/program/src/lib.rs:145-155`

- [ ] **Step 1: Add new error variants**

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

- [ ] **Step 2: Commit**

```bash
git add program/programs/program/src/lib.rs
git commit -m "feat: add new error codes"
```

---

### Task 3: Add settle_position Instruction

**Files:**
- Modify: `program/programs/program/src/lib.rs:66-80`
- Modify: `program/programs/program/src/lib.rs:116-122`

- [ ] **Step 1: Add settle_position instruction**

```rust
/// Settle a user's prediction after market resolves
pub fn settle_position(ctx: Context<SettlePosition>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let prediction = &mut ctx.accounts.prediction;

    require!(market.resolved, GossipError::NotResolved);
    require!(!prediction.settled, GossipError::AlreadySettled);

    let z_score = (market.final_outcome - prediction.initial_mu) / prediction.initial_sigma;
    let density = (1.0 / (prediction.initial_sigma * (2.0 * std::f64::consts::PI).sqrt()))
        * (-0.5 * z_score.powi(2)).exp();
    let multiplier = density * 100000.0;

    let payout = (prediction.amount as f64 * multiplier) as u64;
    prediction.payout = payout;
    prediction.settled = true;

    msg!("Settled position with payout: {}", payout);
    Ok(())
}
```

- [ ] **Step 2: Add SettlePosition struct**

```rust
#[derive(Accounts)]
pub struct SettlePosition<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut, has_one = owner)]
    pub prediction: Account<'info, Prediction>,
    pub owner: Signer<'info>,
}
```

- [ ] **Step 3: Commit**

```bash
git add program/programs/program/src/lib.rs
git commit -m "feat: add settle_position instruction"
```

---

### Task 4: Add update_market Instruction

**Files:**
- Modify: `program/programs/program/src/lib.rs`

- [ ] **Step 1: Add update_market instruction**

```rust
/// Update market parameters (oracle only)
pub fn update_market(ctx: Context<UpdateMarket>, new_mu: f64, new_sigma: f64) -> Result<()> {
    let market = &mut ctx.accounts.market;

    require!(new_sigma > 0.0, GossipError::InvalidParams);

    market.mu = new_mu;
    market.sigma = new_sigma;

    msg!("Updated market: mu={}, sigma={}", new_mu, new_sigma);
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateMarket<'info> {
    #[account(mut, has_one = authority)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
}
```

- [ ] **Step 2: Commit**

```bash
git add program/programs/program/src/lib.rs
git commit -m "feat: add update_market instruction"
```

---

### Task 5: Update create_market Instruction

**Files:**
- Modify: `program/programs/program/src/lib.rs:10-29`
- Modify: `program/programs/program/src/lib.rs:83-97`

- [ ] **Step 1: Update create_market signature**

```rust
pub fn create_market(
    ctx: Context<CreateMarket>,
    title: String,
    category: String,
    initial_mu: f64,
    initial_sigma: f64,
    b: f64,
    resolution_source: String,
    ends_at: i64,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    market.authority = ctx.accounts.authority.key();
    market.creator = ctx.accounts.authority.key();
    market.title = title;
    market.category = category;
    market.mu = initial_mu;
    market.sigma = initial_sigma;
    market.b = b;
    market.total_liquidity = 0;
    market.resolved = false;
    market.final_outcome = 0.0;
    market.resolution_source = resolution_source;
    market.ends_at = ends_at;

    msg!("Market Created: {} with mu: {}, sigma: {}", market.title, market.mu, market.sigma);
    Ok(())
}
```

- [ ] **Step 2: Update CreateMarket account space**

```rust
#[derive(Accounts)]
#[instruction(title: String, category: String)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + (4 + title.len()) + (4 + category.len()) + 8 + 8 + 8 + 8 + 1 + 8 + (4 + resolution_source.len()) + 8,
        seeds = [b"market", title.as_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

- [ ] **Step 3: Commit**

```bash
git add program/programs/program/src/lib.rs
git commit -m "feat: update create_market with new parameters"
```

---

### Task 6: Update place_prediction to Set New Fields

**Files:**
- Modify: `program/programs/program/src/lib.rs:31-65`

- [ ] **Step 1: Update place_prediction to initialize new fields**

```rust
pub fn place_prediction(
    ctx: Context<PlacePrediction>,
    point: f64,
    amount: u64,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let prediction = &mut ctx.accounts.prediction;

    msg!("Simulating Reflect CPI: Wrapping {} CASH into rCASH for yield generation.", amount);
    
    let weight = (amount as f64) / (market.b + 1.0);
    let old_mu = market.mu;
    
    market.mu = old_mu + weight * (point - old_mu) / (market.sigma.powi(2) + 0.1);
    market.total_liquidity += amount;

    prediction.owner = ctx.accounts.user.key();
    prediction.market = market.key();
    prediction.point = point;
    prediction.amount = amount;
    prediction.initial_mu = old_mu;
    prediction.initial_sigma = market.sigma;
    prediction.created_at = Clock::get()?.unix_timestamp;
    prediction.settled = false;
    prediction.payout = 0;

    msg!("Prediction placed at {} with amount {}. New mu: {}", point, amount, market.mu);
    Ok(())
}
```

- [ ] **Step 2: Commit**

```bash
git add program/programs/program/src/lib.rs
git commit -m "feat: update place_prediction with timestamp and settlement fields"
```

---

### Task 7: Update Tests for New Program

**Files:**
- Modify: `program/tests/program.ts`

- [ ] **Step 1: Update test to use new create_market signature**

```typescript
it("Creates a continuous market", async () => {
  await program.methods
    .createMarket(
      marketTitle,
      "Crypto",
      150.0,
      25.0,
      100.0,
      "AI Judge Committee",
      Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
    )
    .accounts({
      market: marketPda,
      authority: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  const marketAccount = await program.account.market.fetch(marketPda);

  assert.equal(marketAccount.title, marketTitle);
  assert.equal(marketAccount.category, "Crypto");
  assert.equal(marketAccount.mu, 150.0);
  assert.equal(marketAccount.sigma, 25.0);
  assert.equal(marketAccount.b, 100.0);
  assert.equal(marketAccount.totalLiquidity.toNumber(), 0);
  assert.isFalse(marketAccount.resolved);
});
```

- [ ] **Step 2: Update place_prediction test**

```typescript
it("Places a prediction and tilts the Gaussian curve", async () => {
  const betAmount = new anchor.BN(10);
  const betPoint = 180.0;

  await program.methods
    .placePrediction(betPoint, betAmount)
    .accounts({
      market: marketPda,
      prediction: predictionPda,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  const marketAccount = await program.account.market.fetch(marketPda);
  const predictionAccount = await program.account.prediction.fetch(predictionPda);

  assert.equal(marketAccount.totalLiquidity.toNumber(), 10);
  assert.isAbove(marketAccount.mu, 150.0);
  assert.isFalse(predictionAccount.settled);
  assert.equal(predictionAccount.payout, 0);
});
```

- [ ] **Step 3: Add settle_position test**

```typescript
it("Settles position after market resolves", async () => {
  // First resolve the market
  await program.methods
    .resolveMarket(185.0)
    .accounts({
      market: marketPda,
      authority: provider.wallet.publicKey,
    })
    .rpc();

  // Then settle the position
  await program.methods
    .settlePosition()
    .accounts({
      market: marketPda,
      prediction: predictionPda,
      owner: provider.wallet.publicKey,
    })
    .rpc();

  const predictionAccount = await program.account.prediction.fetch(predictionPda);

  assert.isTrue(predictionAccount.settled);
  assert.isAbove(predictionAccount.payout, 0);
});
```

- [ ] **Step 4: Run tests to verify**

```bash
cd program && anchor test
```

- [ ] **Step 5: Commit**

```bash
git add program/tests/program.ts
git commit -m "test: update tests for new program instructions"
```

---

## Phase 2: Web App - Data Layer

### Task 8: Create useMarketData Hook

**Files:**
- Create: `web/src/hooks/useMarketData.ts`

- [ ] **Step 1: Write the hook**

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, Idl } from "@coral-xyz/anchor";
import { Gossip } from "@/idl/gossip";
import IDL from "@/idl/gossip.json";

const PROGRAM_ID = new web3.PublicKey(
  "9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi"
);

export interface MarketData {
  mu: number;
  sigma: number;
  totalLiquidity: number;
  resolved: boolean;
  finalOutcome?: number;
  endsAt: number;
  category: string;
  title: string;
}

export function useMarketData(marketTitle: string) {
  const { connection } = useConnection();
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const program = useMemo(() => {
    if (!connection) return null;
    const provider = new AnchorProvider(
      connection,
      web3.PublicKey.default as any,
      { commitment: "confirmed" }
    );
    return new Program(IDL as Idl, provider) as unknown as Program<Gossip>;
  }, [connection]);

  const fetchMarket = async () => {
    if (!program) return;
    try {
      const [marketPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("market"), Buffer.from(marketTitle)],
        program.programId
      );
      const marketAccount = await program.account.market.fetch(marketPda);
      setData({
        mu: marketAccount.mu,
        sigma: marketAccount.sigma,
        totalLiquidity: marketAccount.totalLiquidity.toNumber(),
        resolved: marketAccount.resolved,
        finalOutcome: marketAccount.finalOutcome,
        endsAt: (marketAccount as any).endsAt || 0,
        category: (marketAccount as any).category || "Crypto",
        title: marketAccount.title,
      });
      setError(null);
    } catch (err) {
      setError("Using demo data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 5000);
    return () => clearInterval(interval);
  }, [program, marketTitle]);

  return { data, loading, error, refetch: fetchMarket };
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/hooks/useMarketData.ts
git commit -m "feat: add useMarketData hook"
```

---

### Task 9: Create useUserPositions Hook

**Files:**
- Create: `web/src/hooks/useUserPositions.ts`

- [ ] **Step 1: Write the hook**

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, Idl, BN } from "@coral-xyz/anchor";
import { Gossip } from "@/idl/gossip";
import IDL from "@/idl/gossip.json";

const PROGRAM_ID = new web3.PublicKey(
  "9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi"
);

export interface Position {
  marketTitle: string;
  point: number;
  amount: number;
  initialMu: number;
  initialSigma: number;
  settled: boolean;
  payout: number;
  createdAt: number;
}

const DEMO_POSITIONS: Position[] = [
  {
    marketTitle: "Will SOL hit $250 by Friday?",
    point: 245.0,
    amount: 50,
    initialMu: 198.42,
    initialSigma: 24.5,
    settled: false,
    payout: 0,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
];

export function useUserPositions() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [positions, setPositions] = useState<Position[]>(DEMO_POSITIONS);
  const [loading, setLoading] = useState(false);

  const program = useMemo(() => {
    if (!connection || !wallet.publicKey) return null;
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: "confirmed" }
    );
    return new Program(IDL as Idl, provider) as unknown as Program<Gossip>;
  }, [connection, wallet]);

  const fetchPositions = async () => {
    if (!program || !wallet.publicKey) {
      setPositions(DEMO_POSITIONS);
      return;
    }
    setLoading(true);
    try {
      const allPositions = await program.account.prediction.all([
        {
          memcmp: {
            offset: 0,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);
      setPositions(
        allPositions.map((p) => ({
          marketTitle: (p.account as any).marketTitle || "",
          point: p.account.point,
          amount: p.account.amount.toNumber(),
          initialMu: p.account.initialMu,
          initialSigma: p.account.initialSigma,
          settled: (p.account as any).settled || false,
          payout: (p.account as any).payout || 0,
          createdAt: ((p.account as any).createdAt || 0) * 1000,
        }))
      );
    } catch (err) {
      setPositions(DEMO_POSITIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [program, wallet.publicKey?.toBase58()]);

  return { positions, loading, refetch: fetchPositions };
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/hooks/useUserPositions.ts
git commit -m "feat: add useUserPositions hook"
```

---

### Task 10: Create useWalletBalance Hook

**Files:**
- Create: `web/src/hooks/useWalletBalance.ts`

- [ ] **Step 1: Write the hook**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const DEMO_BALANCE = 5000; // CASH balance for demo

export function useWalletBalance() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(DEMO_BALANCE);
  const [solBalance, setSolBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet.publicKey || !connection) {
        setBalance(DEMO_BALANCE);
        setLoading(false);
        return;
      }
      try {
        const solBal = await connection.getBalance(wallet.publicKey);
        setSolBalance(solBal / LAMPORTS_PER_SOL);
        // In production, fetch actual CASH token balance
        setBalance(DEMO_BALANCE);
      } catch (err) {
        setBalance(DEMO_BALANCE);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [wallet.publicKey, connection]);

  return { balance, solBalance, loading };
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/hooks/useWalletBalance.ts
git commit -m "feat: add useWalletBalance hook"
```

---

## Phase 3: Trading Flow

### Task 11: Create Toast Notification System

**Files:**
- Create: `web/src/components/Toast.tsx`

- [ ] **Step 1: Write Toast component**

```typescript
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  txLink?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, txLink?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: string, txLink?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, txLink }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="flex items-center gap-3 px-4 py-3 min-w-[300px]"
              style={{
                background: "#1A0808",
                border: "1px solid rgba(227,24,55,0.2)",
              }}
            >
              {icons[toast.type]}
              <span className="flex-1 text-sm text-white">{toast.message}</span>
              {toast.txLink && (
                <a
                  href={toast.txLink}
                  target="_blank"
                  className="text-xs text-[#E31837] hover:underline"
                >
                  View
                </a>
              )}
              <button onClick={() => removeToast(toast.id)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/Toast.tsx
git commit -m "feat: add toast notification system"
```

---

### Task 12: Create Trading Modal

**Files:**
- Create: `web/src/components/TradingModal.tsx`

- [ ] **Step 1: Write TradingModal component**

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2 } from "lucide-react";

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  prediction: number;
  stake: number;
  multiplier: string;
  potentialPayout: string;
  balance: number;
}

export default function TradingModal({
  isOpen,
  onClose,
  onConfirm,
  prediction,
  stake,
  multiplier,
  potentialPayout,
  balance,
}: TradingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (stake > balance) {
      setError("Insufficient balance");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md p-6"
            style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Confirm Prediction</h2>
              <button onClick={onClose} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-white/60">Prediction</span>
                <span className="font-mono text-white">${prediction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Stake</span>
                <span className="font-mono text-white">{stake} CASH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Multiplier</span>
                <span className="font-mono text-green-500">{multiplier}x</span>
              </div>
              <div className="flex justify-between pt-4" style={{ borderTop: "1px solid rgba(227,24,55,0.2)" }}>
                <span className="font-semibold text-white">Potential Payout</span>
                <span className="font-mono font-bold text-lg text-white">{potentialPayout} CASH</span>
              </div>
              {error && (
                <div className="p-3 text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)" }}>
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full py-4 font-semibold text-white uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "#E31837" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  Confirm <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/TradingModal.tsx
git commit -m "feat: add trading modal"
```

---

## Phase 4: Pages Enhancement

### Task 13: Update Market Detail Page with Real Data

**Files:**
- Modify: `web/src/app/market/[id]/page.tsx`

- [ ] **Step 1: Add hooks import**

```typescript
import { useMarketData } from "@/hooks/useMarketData";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useToast } from "@/components/Toast";
import TradingModal from "@/components/TradingModal";
```

- [ ] **Step 2: Replace mock data with hooks**

```typescript
const { data: marketData, loading: marketLoading } = useMarketData(MARKET_TITLE);
const { balance } = useWalletBalance();
const { showToast } = useToast();

// Use marketData when available, fallback to defaults
const mu = marketData?.mu ?? 198.42;
const sigma = marketData?.sigma ?? 24.5;
const liquidity = marketData?.totalLiquidity ?? 124500;
```

- [ ] **Step 3: Update handleBet with toast**

```typescript
const handleBet = async () => {
  const val = parseFloat(betValue);
  if (isNaN(val)) return;

  setIsBetting(true);
  setPrediction(val);

  if (!wallet.publicKey || !program) {
    // Demo mode
    setTimeout(() => {
      setMu((prev) => prev + (val - prev) * 0.05);
      setLiquidity((prev) => prev + parseFloat(stakeAmount || "10"));
      setIsBetting(false);
      showToast("success", "Prediction placed (Demo Mode)");
    }, 1200);
    return;
  }

  try {
    // ... existing program logic ...
    showToast("success", "Prediction placed successfully!", `https://solana.com/explorer/tx/${tx}`);
  } catch (err) {
    showToast("error", "Transaction failed. Please try again.");
  } finally {
    setIsBetting(false);
  }
};
```

- [ ] **Step 4: Add TradingModal**

```typescript
const [showModal, setShowModal] = useState(false);

return (
  <>
    {/* ... existing UI ... */}
    <button 
      onClick={() => setShowModal(true)}
      className="w-full py-4 ..."
    >
      PLACE PREDICTION
    </button>
    <TradingModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onConfirm={handleBet}
      prediction={parseFloat(betValue)}
      stake={parseFloat(stakeAmount)}
      multiplier={impliedMultiplier}
      potentialPayout={potentialPayout}
      balance={balance}
    />
  </>
);
```

- [ ] **Step 5: Commit**

```bash
git add web/src/app/market/[id]/page.tsx
git commit -m "feat: integrate market data hooks and trading modal"
```

---

### Task 14: Update Portfolio Page with Real Positions

**Files:**
- Modify: `web/src/app/portfolio/page.tsx`

- [ ] **Step 1: Add hooks import**

```typescript
import { useUserPositions } from "@/hooks/useUserPositions";
import { useMarketData } from "@/hooks/useMarketData";
```

- [ ] **Step 2: Replace mock positions with hook**

```typescript
const { positions, loading: positionsLoading } = useUserPositions();

// Calculate P&L for each position
const calculatePnL = (pos: any, currentMu: number) => {
  const zScore = (currentMu - pos.initialMu) / pos.initialSigma;
  const density = (1 / (pos.initialSigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(zScore, 2));
  const multiplier = density * 100000;
  return ((multiplier - 1) * pos.amount).toFixed(2);
};
```

- [ ] **Step 3: Add position close functionality**

```typescript
const handleClosePosition = (position: any) => {
  showToast("info", "Position close not yet implemented");
};
```

- [ ] **Step 4: Commit**

```bash
git add web/src/app/portfolio/page.tsx
git commit -m "feat: integrate user positions data"
```

---

### Task 15: Add Live Search to Markets Page

**Files:**
- Modify: `web/src/app/markets/page.tsx`

- [ ] **Step 1: Add search state and filtering**

```typescript
const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("All");

const filteredMarkets = markets.filter((m) => {
  const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
  return matchesSearch && matchesCategory;
});
```

- [ ] **Step 2: Add debounced search handler**

```typescript
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value);
};
```

- [ ] **Step 3: Update filter buttons with onClick**

```typescript
{["All", "Crypto", "Finance", "Weather", "Macro", "AI"].map((cat) => (
  <button
    key={cat}
    onClick={() => setSelectedCategory(cat)}
    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
    style={{
      background: selectedCategory === cat ? "#E31837" : "transparent",
      color: "#FFFFFF",
      border: selectedCategory === cat ? "none" : "1px solid rgba(255,255,255,0.1)",
    }}
  >
    {cat}
  </button>
))}
```

- [ ] **Step 4: Commit**

```bash
git add web/src/app/markets/page.tsx
git commit -m "feat: add live search and category filtering"
```

---

### Task 16: Create Agent Deploy Wizard

**Files:**
- Create: `web/src/app/agents/deploy/page.tsx`

- [ ] **Step 1: Create deploy page with wizard steps**

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Settings, Code, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  { id: 1, title: "Upload Model", icon: Upload },
  { id: 2, title: "Configure", icon: Settings },
  { id: 3, title: "MCP Config", icon: Code },
];

export default function DeployAgentPage() {
  const [step, setStep] = useState(1);
  const [modelFile, setModelFile] = useState<string | null>(null);
  const [params, setParams] = useState({ budget: 100, riskLevel: "medium" });
  const [mcpConfig, setMcpConfig] = useState<string | null>(null);

  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Steps indicator */}
        <div className="flex justify-between mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  background: step >= s.id ? "#E31837" : "rgba(255,255,255,0.1)",
                }}
              >
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm text-white/60 hidden sm:block">{s.title}</span>
              {i < steps.length - 1 && <div className="w-12 h-px mx-4 bg-white/10" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-white mb-6">Upload Your Model</h2>
            <div
              className="border-2 border-dashed p-12 text-center cursor-pointer hover:border-[#E31837] transition-colors"
              style={{ borderColor: "rgba(227,24,55,0.3)" }}
              onClick={() => setModelFile("model.pt")}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60">Drop your .pt file here or click to browse</p>
            </div>
            {modelFile && (
              <div className="mt-4 p-4 flex items-center gap-3" style={{ background: "#1A0808" }}>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-white">{modelFile}</span>
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              disabled={!modelFile}
              className="mt-6 w-full py-4 font-semibold text-white uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "#E31837" }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-white mb-6">Configure Parameters</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">Budget (CASH)</label>
                <input
                  type="number"
                  value={params.budget}
                  onChange={(e) => setParams({ ...params, budget: parseInt(e.target.value) })}
                  className="w-full p-4 text-white"
                  style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.2)" }}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Risk Level</label>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setParams({ ...params, riskLevel: r })}
                      className="px-4 py-2 text-sm uppercase"
                      style={{
                        background: params.riskLevel === r ? "#E31837" : "transparent",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setMcpConfig(JSON.stringify({ model: modelFile, ...params }, null, 2));
                setStep(3);
              }}
              className="mt-6 w-full py-4 font-semibold text-white uppercase tracking-wider flex items-center justify-center gap-2"
              style={{ background: "#E31837" }}
            >
              Generate Config <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 3: MCP Config */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-white mb-6">MCP Configuration</h2>
            <pre
              className="p-4 text-sm font-mono text-white/80 overflow-x-auto"
              style={{ background: "#0D0202", border: "1px solid rgba(227,24,55,0.2)" }}
            >
              {mcpConfig}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(mcpConfig || "")}
              className="mt-6 px-6 py-3 font-semibold text-white uppercase tracking-wider"
              style={{ background: "#4A0404", border: "1px solid rgba(227,24,55,0.2)" }}
            >
              Copy to Clipboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/agents/deploy/page.tsx
git commit -m "feat: add agent deploy wizard"
```

---

## Phase 5: UI/UX Polish

### Task 17: Add Skeleton Loaders

**Files:**
- Create: `web/src/components/Skeleton.tsx`

- [ ] **Step 1: Write Skeleton component**

```typescript
"use client";

import { motion } from "framer-motion";

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`bg-white/5 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-2 px-6 py-4">
      <Skeleton className="h-4 w-8" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/components/Skeleton.tsx
git commit -m "feat: add skeleton loader components"
```

---

### Task 18: Add ToastProvider to Layout

**Files:**
- Modify: `web/src/app/layout.tsx`

- [ ] **Step 1: Add ToastProvider import and wrap**

```typescript
import { ToastProvider } from "@/components/Toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SolanaWalletProvider>
          <ToastProvider>
            <AnimatedBackground />
            <Navbar />
            <div className="pt-16">{children}</div>
          </ToastProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/layout.tsx
git commit -m "feat: add ToastProvider to layout"
```

---

## Implementation Complete

The plan covers:
- Phase 1: Solana program (7 tasks) - account updates, new instructions, tests
- Phase 2: Web data layer (3 tasks) - custom hooks for market data, positions, balance
- Phase 3: Trading flow (2 tasks) - toast system, trading modal
- Phase 4: Pages (4 tasks) - market detail, portfolio, markets search, agent deploy wizard
- Phase 5: UI polish (2 tasks) - skeletons, toast provider

**Plan complete and saved to `docs/superpowers/plans/2026-05-12-gossip-fullstack-upgrade-plan.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?