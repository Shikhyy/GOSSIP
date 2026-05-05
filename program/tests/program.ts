import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import { Gossip } from "../target/types/gossip";

describe("gossip", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Gossip as Program<Gossip>;
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  
  const marketTitle = "Will SOL hit 250 by Friday?";

  // Find PDAs
  const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("market"), Buffer.from(marketTitle)],
    program.programId
  );

  const [predictionPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("prediction"), marketPda.toBuffer(), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  it("Creates a continuous market", async () => {
    // Call the create_market instruction
    await program.methods
      .createMarket(marketTitle, 150.0, 25.0, 100.0)
      .accounts({
        market: marketPda,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Fetch the created account
    const marketAccount = await program.account.market.fetch(marketPda);

    // Assert state
    assert.equal(marketAccount.title, marketTitle);
    assert.equal(marketAccount.mu, 150.0);
    assert.equal(marketAccount.sigma, 25.0);
    assert.equal(marketAccount.b, 100.0);
    assert.equal(marketAccount.totalLiquidity.toNumber(), 0);
    assert.isFalse(marketAccount.resolved);
  });

  it("Places a prediction and tilts the Gaussian curve", async () => {
    const betAmount = new anchor.BN(10); // Betting 10 CASH
    const betPoint = 180.0; // Betting that the outcome will be 180

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

    // Check if total liquidity increased
    assert.equal(marketAccount.totalLiquidity.toNumber(), 10);
    
    // Check if the market mean (mu) tilted towards 180
    // Initial mu was 150. Weight = 10 / (100 + 1) = 0.099
    // New mu = 150 + 0.099 * (180 - 150) / (25^2 + 0.1) -> shifted slightly right
    assert.isAbove(marketAccount.mu, 150.0);
    console.log("New Market Consensus (mu):", marketAccount.mu);

    // Assert Prediction state
    assert.equal(predictionAccount.point, 180.0);
    assert.equal(predictionAccount.amount.toNumber(), 10);
    assert.equal(predictionAccount.initialMu, 150.0);
  });
});

