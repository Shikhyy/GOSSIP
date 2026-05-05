import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * GOSSIP MCP Server: The AI Interface for Continuous Prediction Markets.
 */
class GossipServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "gossip-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_market_state",
          description: "Get the current consensus (mu and sigma) of a GOSSIP market.",
          inputSchema: {
            type: "object",
            properties: {
              marketTitle: { type: "string", description: "The title of the market" },
            },
            required: ["marketTitle"],
          },
        },
        {
          name: "place_density_bet",
          description: "Place a continuous prediction (bet) on a specific point on the curve.",
          inputSchema: {
            type: "object",
            properties: {
              marketTitle: { type: "string" },
              point: { type: "number", description: "The continuous value being predicted" },
              amount: { type: "number", description: "Amount of CASH to bet" },
            },
            required: ["marketTitle", "point", "amount"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "get_market_state": {
          const { marketTitle } = request.params.arguments as { marketTitle: string };
          // Mock data for now - will connect to Solana in next iteration
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  market: marketTitle,
                  mu: 150.5,
                  sigma: 25.0,
                  totalLiquidity: 1000,
                  resolved: false,
                }),
              },
            ],
          };
        }

        case "place_density_bet": {
          const { marketTitle, point, amount } = request.params.arguments as {
            marketTitle: string;
            point: number;
            amount: number;
          };
          return {
            content: [
              {
                type: "text",
                text: `Successfully placed bet of ${amount} CASH at point ${point} for market ${marketTitle}.`,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("GOSSIP MCP server running on stdio");
  }
}

const server = new GossipServer();
server.run().catch(console.error);
