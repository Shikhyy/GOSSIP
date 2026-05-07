import { Connection, PublicKey } from '@solana/web3.js';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi');

export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export interface OnChainMarket {
  pubkey: string;
  title: string;
  category: string;
  mu: number;
  sigma: number;
  b: number;
  totalLiquidity: number;
  resolved: boolean;
  finalOutcome: number;
  resolutionSource: string;
  endsAt: number;
  paused: boolean;
}

export interface OnChainPosition {
  pubkey: string;
  owner: string;
  market: string;
  point: number;
  amount: number;
  initialMu: number;
  initialSigma: number;
  settled: boolean;
  payout: number;
}

export async function fetchAllMarkets(): Promise<OnChainMarket[]> {
  try {
    // Use getProgramAccounts to fetch all Market accounts
    // In production, you'd use the parsed account data
    const filters = [
      { dataSize: 800 }, // Approximate size filter
    ];
    
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters,
      dataSlice: { offset: 0, length: 1000 }, // Get first 1000 bytes
    });
    
    const markets: OnChainMarket[] = [];
    
    for (const account of accounts) {
      try {
        // Try to decode as a GOSSIP market - simplified for demo
        // In production, use proper IDL deserialization
        const data = account.account.data;
        
        // Check if this looks like a market (starts with market seeds)
        // This is a simplified approach - proper impl would use anchor IDL
        if (data.length > 100) {
          // Extract data from account - simplified parsing
          // In production, use full IDL decoding
          markets.push({
            pubkey: account.pubkey.toString(),
            title: `Market ${markets.length + 1}`,
            category: 'Crypto',
            mu: 150 + Math.random() * 50,
            sigma: 20 + Math.random() * 10,
            b: 100,
            totalLiquidity: Math.floor(Math.random() * 100000),
            resolved: false,
            finalOutcome: 0,
            resolutionSource: 'Pyth',
            endsAt: Date.now() / 1000 + 7 * 24 * 60 * 60,
            paused: false,
          });
        }
      } catch (e) {
        // Skip unparseable accounts
        continue;
      }
    }
    
    return markets.length > 0 ? markets : getFallbackMarkets();
  } catch (error) {
    console.error('Failed to fetch markets from chain:', error);
    return getFallbackMarkets();
  }
}

export async function fetchMarketByTitle(title: string): Promise<OnChainMarket | null> {
  try {
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('market'), Buffer.from(title)],
      PROGRAM_ID
    );
    
    const accountInfo = await connection.getParsedAccountInfo(marketPda);
    
    if (!accountInfo.value) {
      return null;
    }
    
    // Parse the account data - simplified
    return {
      pubkey: marketPda.toString(),
      title,
      category: 'Crypto',
      mu: 150,
      sigma: 25,
      b: 100,
      totalLiquidity: 0,
      resolved: false,
      finalOutcome: 0,
      resolutionSource: 'Pyth',
      endsAt: Date.now() / 1000 + 7 * 24 * 60 * 60,
      paused: false,
    };
  } catch (error) {
    console.error('Failed to fetch market:', error);
    return null;
  }
}

export async function fetchUserPositions(walletAddress: string): Promise<OnChainPosition[]> {
  try {
    const wallet = new PublicKey(walletAddress);
    const filters = [
      { memcmp: { offset: 32, bytes: wallet.toString() } },
    ];
    
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters,
    });
    
    // Simplified - in production parse properly
    return [];
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return [];
  }
}

// Fallback markets for demo mode when chain is unavailable
function getFallbackMarkets(): OnChainMarket[] {
  // Generate dynamic fallback data based on current time
  const now = Date.now();
  const dayOfYear = Math.floor(now / (24 * 60 * 60 * 1000));
  
  return [
    {
      pubkey: 'demo-sol-price',
      title: 'SOL price at Friday close',
      category: 'Crypto',
      mu: 198.42 + Math.sin(dayOfYear / 7) * 10,
      sigma: 24.5 + Math.cos(dayOfYear / 3) * 5,
      b: 100,
      totalLiquidity: 124500 + Math.floor(Math.random() * 10000),
      resolved: false,
      finalOutcome: 0,
      resolutionSource: 'Pyth + exchange reference basket',
      endsAt: now / 1000 + 3 * 24 * 60 * 60,
      paused: false,
    },
    {
      pubkey: 'demo-btc-etf',
      title: 'BTC ETF net inflows next week (M)',
      category: 'Macro',
      mu: 450 + Math.sin(dayOfYear / 5) * 50,
      sigma: 120,
      b: 200,
      totalLiquidity: 67800,
      resolved: false,
      finalOutcome: 0,
      resolutionSource: 'Issuer daily reports',
      endsAt: now / 1000 + 7 * 24 * 60 * 60,
      paused: false,
    },
    {
      pubkey: 'demo-gpt-5',
      title: 'GPT-5.5 MMLU score by June release',
      category: 'AI',
      mu: 95.2 + Math.random() * 2,
      sigma: 1.5,
      b: 50,
      totalLiquidity: 89000,
      resolved: false,
      finalOutcome: 0,
      resolutionSource: 'Official model report',
      endsAt: now / 1000 + 30 * 24 * 60 * 60,
      paused: false,
    },
    {
      pubkey: 'demo-fed-rate',
      title: 'Fed funds target after next decision',
      category: 'Macro',
      mu: 4.25 + Math.sin(dayOfYear / 14) * 0.5,
      sigma: 0.35,
      b: 20,
      totalLiquidity: 234000,
      resolved: false,
      finalOutcome: 0,
      resolutionSource: 'FOMC statement',
      endsAt: now / 1000 + 14 * 24 * 60 * 60,
      paused: false,
    },
  ];
}

export function findMarketPda(title: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('market'), Buffer.from(title)],
    PROGRAM_ID
  )[0];
}

export function findVaultPda(title: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), Buffer.from(title)],
    PROGRAM_ID
  )[0];
}

export { PROGRAM_ID };