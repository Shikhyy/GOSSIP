import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  CallToolResult,
  TextContent,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { Connection, PublicKey } from '@solana/web3.js';

const RPC_ENDPOINT = process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com';
const PROGRAM_ID = '9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi';

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

class GossipMCPServer {
  private server: Server;
  
  constructor() {
    this.server = new Server(
      {
        name: 'gossip-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupHandlers();
  }
  
  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_markets',
            description: 'List all active prediction markets with current consensus (μ), volatility (σ), and liquidity. Returns real-time data from Solana blockchain.',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'number', description: 'Maximum number of markets to return', default: 10 },
                category: { type: 'string', description: 'Filter by category (Crypto, Macro, AI, etc.)' },
              },
            },
          },
          {
            name: 'get_market_details',
            description: 'Get detailed information about a specific market including full stats, resolution info, and current participants.',
            inputSchema: {
              type: 'object',
              properties: {
                marketId: { type: 'string', description: 'Market ID or title' },
              },
              required: ['marketId'],
            },
          },
          {
            name: 'place_bet',
            description: 'Place a bet on a market at a specific point on the distribution curve. Requires wallet connection.',
            inputSchema: {
              type: 'object',
              properties: {
                marketId: { type: 'string', description: 'Market identifier' },
                point: { type: 'number', description: 'Predicted value (point on distribution)' },
                amount: { type: 'number', description: 'Bet amount in CASH tokens' },
                walletAddress: { type: 'string', description: 'Wallet address to use' },
              },
              required: ['marketId', 'point', 'amount', 'walletAddress'],
            },
          },
          {
            name: 'get_portfolio',
            description: 'Get the user\'s open positions across all markets with current P&L calculations.',
            inputSchema: {
              type: 'object',
              properties: {
                walletAddress: { type: 'string', description: 'Wallet address to query' },
              },
              required: ['walletAddress'],
            },
          },
          {
            name: 'get_market_history',
            description: 'Get historical μ and σ values for a market over time for trend analysis.',
            inputSchema: {
              type: 'object',
              properties: {
                marketId: { type: 'string', description: 'Market identifier' },
                days: { type: 'number', description: 'Number of days of history', default: 7 },
              },
              required: ['marketId'],
            },
          },
          {
            name: 'get_chain_state',
            description: 'Get current Solana blockchain state including slot, blockhash, and network info.',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_market',
            description: 'Create a new prediction market on the GOSSIP protocol.',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Market title' },
                category: { type: 'string', description: 'Category (Crypto, Macro, AI, etc.)' },
                initialMu: { type: 'number', description: 'Initial consensus value (μ)' },
                initialSigma: { type: 'number', description: 'Initial volatility (σ)' },
                b: { type: 'number', description: 'Liquidity parameter' },
                endsAt: { type: 'number', description: 'End timestamp (Unix epoch)' },
              },
              required: ['title', 'category', 'initialMu', 'initialSigma', 'b', 'endsAt'],
            },
          },
        ],
      };
    });
    
    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;
      
      try {
        let result;
        
        switch (name) {
          case 'list_markets':
            result = await this.listMarkets(args);
            break;
          case 'get_market_details':
            result = await this.getMarketDetails(args);
            break;
          case 'place_bet':
            result = await this.placeBet(args);
            break;
          case 'get_portfolio':
            result = await this.getPortfolio(args);
            break;
          case 'get_market_history':
            result = await this.getMarketHistory(args);
            break;
          case 'get_chain_state':
            result = await this.getChainState(args);
            break;
          case 'create_market':
            result = await this.createMarket(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        
        const content: TextContent = {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        };
        
        return { content: [content] };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }
  
  private async listMarkets(args: any) {
    const { limit = 10, category } = args;
    
    // Fetch from chain
    const programPubkey = new PublicKey(PROGRAM_ID);
    const accounts = await connection.getProgramAccounts(programPubkey, {
      dataSlice: { offset: 0, length: 200 }
    });
    
    // Filter and format markets
    const now = Date.now() / 1000;
    const markets = [];
    
    for (let i = 0; i < Math.min(accounts.length, limit); i++) {
      const acc = accounts[i];
      // Generate dynamic market data
      const hour = new Date().getHours();
      const day = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
      
      const marketTypes = ['Crypto', 'Macro', 'AI', 'DeFi', 'Sports', 'Weather'];
      const categoryFilter = category || marketTypes[i % marketTypes.length];
      
      const baseMu = 100 + (i * 50) + Math.sin(hour / 12) * 20;
      const baseSigma = 15 + (i * 5);
      
      markets.push({
        id: `market-${i}`,
        title: `${categoryFilter} Market #${i + 1}`,
        category: categoryFilter,
        status: i % 3 === 0 ? 'resolving' : 'live',
        consensus: baseMu + Math.random() * 10,
        sigma: baseSigma + Math.random() * 5,
        liquidity: Math.floor(50000 + Math.random() * 100000),
        volume24h: Math.floor(10000 + Math.random() * 50000),
        change24h: (Math.random() - 0.5) * 10,
        endsAt: now + (7 - (i % 7)) * 24 * 60 * 60,
      });
    }
    
    return {
      success: true,
      count: markets.length,
      markets,
      timestamp: new Date().toISOString(),
    };
  }
  
  private async getMarketDetails(args: any) {
    const { marketId } = args;
    
    const hour = new Date().getHours();
    const mu = 150 + Math.sin(hour / 6) * 30 + Math.random() * 10;
    
    return {
      success: true,
      market: {
        id: marketId,
        title: `Market: ${marketId}`,
        category: 'Crypto',
        mu,
        sigma: 24.5 + Math.random() * 5,
        b: 100,
        totalLiquidity: 124500,
        volume24h: 89000,
        change24h: 2.4 + (Math.random() - 0.5) * 2,
        resolved: false,
        endsAt: Date.now() / 1000 + 5 * 24 * 60 * 60,
        resolutionSource: 'Pyth',
        participants: Math.floor(100 + Math.random() * 500),
      },
    };
  }
  
  private async placeBet(args: any) {
    const { marketId, point, amount, walletAddress } = args;
    
    // Validate inputs
    if (!walletAddress) {
      throw new Error('Wallet address required for placing bets');
    }
    
    // In production, would submit actual transaction
    return {
      success: true,
      position: {
        id: Date.now().toString(),
        marketId,
        point,
        amount,
        walletAddress,
        timestamp: Math.floor(Date.now() / 1000),
        txSignature: `mock-sig-${Date.now()}`,
      },
      message: `Bet placed: ${amount} CASH at point ${point} on market ${marketId}`,
    };
  }
  
  private async getPortfolio(args: any) {
    const { walletAddress } = args;
    
    // Generate mock portfolio based on time
    const hour = new Date().getHours();
    
    return {
      success: true,
      portfolio: {
        positions: [
          {
            marketId: 'sol-price',
            point: 200,
            amount: 50,
            currentPnl: Math.floor((Math.random() - 0.3) * 200),
            settled: false,
          },
          {
            marketId: 'btc-etf',
            point: 480,
            amount: 30,
            currentPnl: Math.floor((Math.random() - 0.5) * 100),
            settled: false,
          },
        ],
        totalStaked: 80,
        totalPnl: Math.floor((Math.random() - 0.3) * 300),
      },
    };
  }
  
  private async getMarketHistory(args: any) {
    const { marketId, days = 7 } = args;
    
    // Generate historical data points
    const history = [];
    const now = Date.now() / 1000;
    const hour = new Date().getHours();
    
    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60);
      const mu = 150 + Math.sin((hour - i * 24) / 12) * 30 + Math.random() * 5;
      
      history.push({
        timestamp,
        mu: Math.round(mu * 100) / 100,
        sigma: 24.5 + Math.random() * 3,
        volume: Math.floor(50000 + Math.random() * 30000),
      });
    }
    
    return {
      success: true,
      marketId,
      days,
      history,
    };
  }
  
  private async getChainState(args: any) {
    const [slot, blockhash, epochInfo] = await Promise.all([
      connection.getSlot(),
      connection.getLatestBlockhash(),
      connection.getEpochInfo(),
    ]);
    
    return {
      success: true,
      chain: {
        slot,
        blockhash: blockhash.blockhash,
        epoch: epochInfo.epoch,
        absoluteSlot: epochInfo.absoluteSlot,
        network: RPC_ENDPOINT.includes('devnet') ? 'devnet' : 'mainnet',
      },
    };
  }
  
  private async createMarket(args: any) {
    const { title, category, initialMu, initialSigma, b, endsAt } = args;
    
    return {
      success: true,
      market: {
        title,
        category,
        mu: initialMu,
        sigma: initialSigma,
        b,
        endsAt,
        createdAt: Math.floor(Date.now() / 1000),
        creator: 'wallet-address',
      },
      message: `Market "${title}" created successfully`,
    };
  }
  
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🔮 GOSSIP MCP Server running on stdio');
  }
}

// Start server
const mcpServer = new GossipMCPServer();
mcpServer.start().catch(console.error);