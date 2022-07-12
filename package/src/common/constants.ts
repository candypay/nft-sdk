import * as anchor from "@project-serum/anchor";

const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
  "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
);

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const CIVIC = new anchor.web3.PublicKey(
  "gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs"
);

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const DEFAULT_TIMEOUT = 60000;

const RPC_URLS = new Map([
  ["devnet", "https://api.devnet.solana.com"],
  ["testnet", "https://api.testnet.solana.com"],
  ["mainnet-beta", "https://mainnet-beta.solana.com"],
]);

export {
  CANDY_MACHINE_PROGRAM,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  CIVIC,
  TOKEN_METADATA_PROGRAM_ID,
  DEFAULT_TIMEOUT,
  RPC_URLS,
};
