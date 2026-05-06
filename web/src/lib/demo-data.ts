export type MarketCategory =
  | "Crypto"
  | "Macro"
  | "AI"
  | "Sports"
  | "Weather"
  | "Politics";

export interface MarketRecord {
  id: string;
  title: string;
  subtitle: string;
  category: MarketCategory;
  status: "live" | "resolving" | "upcoming";
  consensus: number;
  sigma: number;
  liquidity: number;
  volume24h: number;
  change24h: number;
  participation: number;
  resolutionLabel: string;
  resolutionSource: string;
  unit: string;
  outcomeLabel: string;
  featured?: boolean;
  agentBias?: "bullish" | "bearish" | "neutral";
}

export interface AgentRecord {
  id: string;
  name: string;
  strategy: string;
  pnl: number;
  accuracy: number;
  status: "active" | "cooldown" | "offline";
  markets: number;
  dailyVolume: number;
  summary: string;
}

export interface AgentActivity {
  agent: string;
  market: string;
  action: string;
  confidence: number;
  timestamp: string;
}

export const markets: MarketRecord[] = [
  {
    id: "sol-price",
    title: "SOL price at Friday close",
    subtitle: "Continuous market for exact settlement on the next weekly close.",
    category: "Crypto",
    status: "live",
    consensus: 198.42,
    sigma: 24.5,
    liquidity: 124500,
    volume24h: 890000,
    change24h: 2.4,
    participation: 1482,
    resolutionLabel: "May 8, 2026, 12:00 PM UTC",
    resolutionSource: "Pyth + exchange reference basket",
    unit: "$",
    outcomeLabel: "SOL / USD",
    featured: true,
    agentBias: "bullish",
  },
  {
    id: "btc-etf",
    title: "BTC ETF net inflows next week",
    subtitle: "Exact inflow amount across the major U.S. spot ETF complex.",
    category: "Macro",
    status: "live",
    consensus: 450,
    sigma: 120,
    liquidity: 67800,
    volume24h: 420000,
    change24h: -1.1,
    participation: 824,
    resolutionLabel: "May 13, 2026, 8:00 PM UTC",
    resolutionSource: "Issuer daily reports",
    unit: "$M",
    outcomeLabel: "Net inflows",
    agentBias: "neutral",
  },
  {
    id: "gpt-5-mmlu",
    title: "GPT-5.5 MMLU score by June release",
    subtitle: "Tracks the headline benchmark score for the next public evaluation cycle.",
    category: "AI",
    status: "live",
    consensus: 95.2,
    sigma: 1.5,
    liquidity: 89000,
    volume24h: 340000,
    change24h: 0.8,
    participation: 673,
    resolutionLabel: "June 1, 2026, 5:00 PM UTC",
    resolutionSource: "Official model report",
    unit: "%",
    outcomeLabel: "Benchmark score",
    agentBias: "bullish",
  },
  {
    id: "nyc-temp",
    title: "NYC temperature on Dec 31",
    subtitle: "Weather market resolved against the official Central Park reading.",
    category: "Weather",
    status: "live",
    consensus: 38.5,
    sigma: 8.2,
    liquidity: 34500,
    volume24h: 156000,
    change24h: 1.6,
    participation: 441,
    resolutionLabel: "December 31, 2026, 11:59 PM EST",
    resolutionSource: "NOAA station data",
    unit: "°F",
    outcomeLabel: "Daily close",
    agentBias: "bearish",
  },
  {
    id: "fed-rate",
    title: "Fed funds target after next decision",
    subtitle: "Continuous contract on the upper bound target rate after the next FOMC.",
    category: "Macro",
    status: "live",
    consensus: 4.25,
    sigma: 0.35,
    liquidity: 234000,
    volume24h: 1200000,
    change24h: 0.2,
    participation: 2140,
    resolutionLabel: "May 19, 2026, 6:00 PM UTC",
    resolutionSource: "FOMC statement",
    unit: "%",
    outcomeLabel: "Target rate",
    featured: true,
    agentBias: "neutral",
  },
  {
    id: "firedancer-outage",
    title: "Firedancer outage count in first 30 days",
    subtitle: "How many full network outages are recorded after rollout?",
    category: "Crypto",
    status: "upcoming",
    consensus: 0.8,
    sigma: 1.2,
    liquidity: 18000,
    volume24h: 41000,
    change24h: 0.5,
    participation: 132,
    resolutionLabel: "May 30, 2026, 12:00 PM UTC",
    resolutionSource: "Validator incident reports",
    unit: "",
    outcomeLabel: "Outages",
    agentBias: "bearish",
  },
];

export const agentLeaderboard: AgentRecord[] = [
  {
    id: "alpha-oracle",
    name: "AlphaOracle v3",
    strategy: "Event-driven cross-market arbitrage",
    pnl: 34.2,
    accuracy: 78.4,
    status: "active",
    markets: 18,
    dailyVolume: 214000,
    summary: "Leans into macro catalysts and reprices thin tails fast.",
  },
  {
    id: "sigma-flow",
    name: "SigmaFlow",
    strategy: "Volatility harvesting",
    pnl: 21.6,
    accuracy: 71.2,
    status: "active",
    markets: 14,
    dailyVolume: 168000,
    summary: "Runs tighter entry bands and prefers liquid weekly contracts.",
  },
  {
    id: "black-swan",
    name: "BlackSwan Hunter",
    strategy: "Tail-risk discovery",
    pnl: 18.9,
    accuracy: 65.8,
    status: "active",
    markets: 9,
    dailyVolume: 92000,
    summary: "Small size, extreme convexity, excellent during narrative breaks.",
  },
  {
    id: "consensus-breaker",
    name: "ConsensusBreaker",
    strategy: "Crowd disagreement scanner",
    pnl: 15.4,
    accuracy: 62.1,
    status: "cooldown",
    markets: 12,
    dailyVolume: 88000,
    summary: "Looks for retail/agent divergence and fades crowded positioning.",
  },
];

export const liveAgentActivity: AgentActivity[] = [
  {
    agent: "AlphaOracle v3",
    market: "SOL price at Friday close",
    action: "Added size into upside tail after funding normalized.",
    confidence: 88,
    timestamp: "2m ago",
  },
  {
    agent: "SigmaFlow",
    market: "Fed funds target after next decision",
    action: "Reduced long vol as implied range compressed.",
    confidence: 74,
    timestamp: "6m ago",
  },
  {
    agent: "BlackSwan Hunter",
    market: "NYC temperature on Dec 31",
    action: "Opened low-size contrarian position in the cold tail.",
    confidence: 81,
    timestamp: "11m ago",
  },
];

export const portfolioSeries = [
  4040, 4068, 4095, 4112, 4106, 4130, 4178, 4216, 4201, 4238,
  4250, 4286, 4305, 4292, 4320, 4355, 4381, 4418, 4446, 4461,
  4484, 4516, 4550, 4532, 4579, 4614, 4630, 4671, 4698, 4722,
];

export const positionHistory = [
  {
    market: "ETH average gas price",
    prediction: 35,
    actual: 28.4,
    stake: 20,
    payout: 0,
    result: "loss" as const,
    date: "May 1, 2026",
  },
  {
    market: "SOL price March close",
    prediction: 185,
    actual: 192.5,
    stake: 30,
    payout: 145.5,
    result: "win" as const,
    date: "Apr 1, 2026",
  },
  {
    market: "AI benchmark score",
    prediction: 92,
    actual: 89.2,
    stake: 15,
    payout: 0,
    result: "loss" as const,
    date: "Mar 15, 2026",
  },
];

export function getMarketById(id: string) {
  return markets.find((market) => market.id === id) ?? markets[0];
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, digits = 1) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}
