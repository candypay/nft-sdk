import * as anchor from "@project-serum/anchor";
import dotenv from "dotenv";
import base58 from "bs58";

dotenv.config();

export const CANDY_MACHINE_ID = new anchor.web3.PublicKey(
  "GrVSy3ZRbuw5ACbwSEMsj9gULk9MW7QPK1TUYcP6nLM"
);
export const PAYER = anchor.web3.Keypair.fromSecretKey(
  base58.decode(process.env.PAYER_SECRET_KEY!)
);
export const USER = new anchor.web3.PublicKey(
  "2S9jKJEGKoVxR3xkEfFyGVrLwJj1H8xYjqtSP5LAX97x"
);
