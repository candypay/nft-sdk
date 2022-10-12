import * as anchor from "@project-serum/anchor";
import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";

export interface CandyMachineAccount {
  id: anchor.web3.PublicKey;
  program: anchor.Program;
  state: CandyMachineState;
}

export interface CandyMachineCollectionData {
  mint: anchor.web3.PublicKey;
  candyMachine: anchor.web3.PublicKey;
}

export type CandyMachineNetworks = "mainnet-beta" | "devnet";

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

export interface CandyMachineMintOptions {
  network: CandyMachineNetworks;
  candyMachineID: string;
  payer: anchor.web3.PublicKey;
}

export interface GaslessMintOptions {
  network: CandyMachineNetworks;
  candyMachineID: string;
  payer: anchor.web3.PublicKey;
  user: anchor.web3.PublicKey;
}

export interface NftAirdropOptions {
  payer: anchor.web3.Keypair;
  owner: anchor.web3.PublicKey;
  network: anchor.web3.Cluster;
  rpc_url?: string;
  metadata: DataV2;
}
