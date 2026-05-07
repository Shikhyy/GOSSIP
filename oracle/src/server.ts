import express from 'express';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
app.use(express.json());

interface OracleConfig {
  rpcEndpoint: string;
  programId: string;
  resolutionCooldown: number;
  pollInterval: number;
}

// Load config
const configPath = path.join(__dirname, 'config.json');
let config: OracleConfig = {
  rpcEndpoint: process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com',
  programId: '9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi',
  resolutionCooldown: 900,
  pollInterval: 60000,
};

if (fs.existsSync(configPath)) {
  config = { ...config, ...JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
}

const connection = new Connection(config.rpcEndpoint, 'confirmed');
const PROGRAM_ID = new PublicKey(config.programId);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    network: config.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet'
  });
});

// Get chain state
app.get('/chain/state', async (req, res) => {
  try {
    const [slot, blockhash, clock] = await Promise.all([
      connection.getSlot(),
      connection.getLatestBlockhash(),
      connection.getEpochInfo()
    ]);
    
    res.json({
      slot,
      blockhash: blockhash.blockhash,
      epoch: clock.epoch,
      absoluteSlot: clock.absoluteSlot,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get market data from chain
app.get('/markets', async (req, res) => {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      dataSlice: { offset: 0, length: 500 }
    });
    
    const markets = accounts.map((acc, idx) => ({
      index: idx,
      pubkey: acc.pubkey.toString(),
      lamports: acc.account.lamports,
    }));
    
    res.json({ 
      count: markets.length, 
      markets,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get price for a market (mock for demo)
app.get('/prices/:marketId', async (req, res) => {
  const { marketId } = req.params;
  
  // In production, integrate with Pyth:
  // const price = await pyth.getPrice(marketId);
  
  // For demo, generate dynamic price based on time
  const now = Date.now();
  const hour = new Date(now).getHours();
  
  const mockPrices: Record<string, { price: number; source: string }> = {
    'sol-price': { 
      price: 198.42 + Math.sin(hour / 12) * 10 + Math.random() * 2, 
      source: 'pyth' 
    },
    'btc-etf': { 
      price: 45000 + Math.sin(hour / 8) * 500, 
      source: 'pyth' 
    },
    'default': { 
      price: 100 + Math.random() * 50, 
      source: 'calculation' 
    }
  };
  
  const priceData = mockPrices[marketId] || mockPrices['default'];
  priceData.price = priceData.price * (1 + (Math.random() - 0.5) * 0.01); // Add micro-variance
  
  res.json({
    marketId,
    ...priceData,
    timestamp: Math.floor(now / 1000),
  });
});

// Resolve a market (admin endpoint)
app.post('/resolve/:marketId', async (req, res) => {
  const { marketId } = req.params;
  const { outcome } = req.body;
  
  if (!outcome) {
    return res.status(400).json({ error: 'Missing outcome parameter' });
  }
  
  // In production, would:
  // 1. Fetch current price from Pyth
  // 2. Submit resolve_market transaction via RPC
  
  console.log(`Resolving market ${marketId} with outcome ${outcome}`);
  
  res.json({
    success: true,
    marketId,
    outcome,
    timestamp: new Date().toISOString(),
    note: 'In production, this would submit on-chain transaction'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    🔮 GOSSIP ORACLE                         ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on port ${PORT}
║  RPC: ${config.rpcEndpoint}
║  Program: ${config.programId.slice(0, 8)}...
║
║  Endpoints:
║    GET  /health         - Health check
║    GET  /chain/state   - Current chain state
║    GET  /markets       - List on-chain markets
║    GET  /prices/:id    - Get market price
║    POST /resolve/:id   - Resolve market
╚═══════════════════════════════════════════════════════════╝
  `);
});

export { app, connection, config };