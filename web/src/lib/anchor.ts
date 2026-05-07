import { Connection, PublicKey } from '@solana/web3.js';

// Program ID from the deployed contract
export const PROGRAM_ID = new PublicKey('9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi');

export function getConnection(): Connection {
  return new Connection(
    process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
    'confirmed'
  );
}

// PDA finder functions - used by hooks for on-chain interactions
export function findMarketPda(title: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('market'), Buffer.from(title)],
    PROGRAM_ID
  )[0];
}

export function findPositionPda(
  market: PublicKey,
  owner: PublicKey,
  positionId: number
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('position'),
      market.toBuffer(),
      owner.toBuffer(),
      Buffer.from(new Uint8Array([positionId]))
    ],
    PROGRAM_ID
  )[0];
}

export function findVaultPda(title: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), Buffer.from(title)],
    PROGRAM_ID
  )[0];
}