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
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import IDL from "@/idl/gossip.json";

// Create standard headers for Solana Actions (CORS)
const headers = createActionHeaders();

const PROGRAM_ID = new PublicKey("9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi");
const MARKET_TITLE = "Will SOL hit 250 by Friday?";

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    title: "GOSSIP: Predict SOL Price",
    icon: "https://ucarecdn.com/7aa46c85-08a4-4bc7-9381-0978bd7b22bd/gossip_logo.png", // Placeholder cool logo
    description: "Place a continuous probability bet on the price of SOL. Infinite upside for tail-end events. Powered by GOSSIP Protocol.",
    label: "Predict",
    links: {
      actions: [
        {
          label: "Bet 10 CASH",
          href: `/api/actions/gossip?amount=10&point={prediction}`,
          parameters: [
            {
              name: "prediction",
              label: "Your Price Prediction (e.g. 180)",
              required: true,
            },
          ],
        },
        {
          label: "Bet 100 CASH",
          href: `/api/actions/gossip?amount=100&point={prediction}`,
          parameters: [
            {
              name: "prediction",
              label: "Your Price Prediction (e.g. 180)",
              required: true,
            },
          ],
        }
      ],
    },
  };

  return Response.json(payload, {
    headers,
  });
};

// Ensure OPTIONS request handles CORS properly
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

    // Connect to Solana
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

    const [predictionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("prediction"), marketPda.toBuffer(), account.toBuffer()],
      PROGRAM_ID
    );

    // Build the instruction
    const ix = await program.methods
      .placePrediction(point, new anchor.BN(amount))
      .accounts({
        market: marketPda,
        prediction: predictionPda,
        user: account,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();

    // Create the transaction
    const transaction = new Transaction({
      feePayer: account,
      recentBlockhash: blockhash,
    }).add(ix);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Successfully locked ${amount} CASH for predicting $${point}`,
      },
    });

    return Response.json(payload, { headers });
  } catch (err) {
    console.error(err);
    return new Response("An unknown error occurred", { status: 500, headers });
  }
};
