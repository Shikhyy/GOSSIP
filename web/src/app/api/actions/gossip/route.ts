import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
} from "@solana/actions";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  Connection,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import IDL from "@/idl/gossip.json";

const headers = createActionHeaders();

const PROGRAM_ID = new PublicKey("9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi");
const MARKET_TITLE = "Will SOL hit 250 by Friday?";

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    title: "🔮 GOSSIP: SOL Price Prediction",
    icon: "https://ucarecdn.com/7aa46c85-08a4-4bc7-9381-0978bd7b22bd/gossip_logo.png",
    description: "The consensus SOL price is $198.42. Think it will be higher or lower? Place a continuous bet with infinite upside. Your prediction tilts the market curve.",
    label: "Predict",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Bet 10 CASH",
          href: `/api/actions/gossip?amount=10&point={prediction}`,
          parameters: [
            {
              name: "prediction",
              label: "Predict SOL Price (e.g. 210)",
              required: true,
            },
          ],
        },
        {
          type: "transaction",
          label: "Bet 100 CASH",
          href: `/api/actions/gossip?amount=100&point={prediction}`,
          parameters: [
            {
              name: "prediction",
              label: "Predict SOL Price (e.g. 210)",
              required: true,
            },
          ],
        }
      ],
    },
  };

  return Response.json(payload, { headers });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const amountParam = url.searchParams.get("amount");
    const pointParam = url.searchParams.get("point");

    if (!amountParam || !pointParam) {
      return new Response("Missing parameters", { status: 400, headers });
    }

    const amount = parseFloat(amountParam);
    const point = parseFloat(pointParam);

    const body: ActionPostRequest = await req.json();
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', { status: 400, headers });
    }

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const provider = new AnchorProvider(
      connection,
      { publicKey: account } as any,
      { commitment: "confirmed" }
    );
    const program = new Program(IDL as Idl, provider);

    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), Buffer.from(MARKET_TITLE)],
      PROGRAM_ID
    );

    // Fetch market state to get the mint
    const marketState = await program.account.market.fetch(marketPda);
    const mint = marketState.mint as PublicKey;

    const userTokenAccount = getAssociatedTokenAddressSync(mint, account);
    
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), Buffer.from(MARKET_TITLE)],
      PROGRAM_ID
    );

    // Use timestamp as a unique prediction ID for the hackathon
    const predictionId = new anchor.BN(Date.now());

    const [predictionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("prediction"), 
        marketPda.toBuffer(), 
        account.toBuffer(), 
        predictionId.toArrayLike(Buffer, "le", 8)
      ],
      PROGRAM_ID
    );

    const ix = await program.methods
      .placePrediction(predictionId, point, new anchor.BN(amount))
      .accounts({
        market: marketPda,
        prediction: predictionPda,
        user: account,
        userTokenAccount: userTokenAccount,
        vault: vaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new Transaction({
      feePayer: account,
      recentBlockhash: blockhash,
    }).add(ix);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: `🔮 Locked ${amount} CASH for predicting SOL at $${point}. Let the gossip begin.`,
      },
    });

    return Response.json(payload, { headers });
  } catch (err) {
    console.error(err);
    return new Response("Market not found or transaction failed", { status: 500, headers });
  }
};
