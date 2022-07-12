/// <reference types="typescript" />

import * as anchor from "@project-serum/anchor";
import { Blockhash, FeeCalculator } from "@solana/web3.js";

export type MintResult = {
  mintTxId: string;
  metadataKey: anchor.web3.PublicKey;
};

export interface BlockhashAndFeeCalculator {
  blockhash: Blockhash;
  feeCalculator: FeeCalculator;
}

export interface CandyMachineAccount {
  id: anchor.web3.PublicKey;
  program: anchor.Program;
  state: CandyMachineState;
}

export type CandyMachineNetworks = "mainnet-beta" | "devnet";

export type SetupState = {
  mint: anchor.web3.Keypair;
  userTokenAccount: anchor.web3.PublicKey;
  transaction: string;
};

export interface CandyMachineState {
  authority: anchor.web3.PublicKey;
  itemsAvailable: number;
  itemsRedeemed: number;
  itemsRemaining: number;
  treasury: anchor.web3.PublicKey;
  tokenMint: null | anchor.web3.PublicKey;
  isSoldOut: boolean;
  isActive: boolean;
  isPresale: boolean;
  isWhitelistOnly: boolean;
  goLiveDate: anchor.BN;
  price: anchor.BN;
  gatekeeper: null | {
    expireOnUse: boolean;
    gatekeeperNetwork: anchor.web3.PublicKey;
  };
  endSettings: null | {
    number: anchor.BN;
    endSettingType: any;
  };
  whitelistMintSettings: null | {
    mode: any;
    mint: anchor.web3.PublicKey;
    presale: boolean;
    discountPrice: null | anchor.BN;
  };
  hiddenSettings: null | {
    name: string;
    uri: string;
    hash: Uint8Array;
  };
  retainAuthority: boolean;
}
