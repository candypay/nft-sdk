import * as anchor from "@project-serum/anchor";
import { Signer } from "@metaplex-foundation/js";

import { CandyMachineNetworks } from "./candy-machine";

export interface GaslessMintInput {
  /**
   * The cluster where the transaction would take place i.e either `mainnet-beta` or `devnet`
   */
  network: CandyMachineNetworks;
  /**
   * The address of the Candy Machine from which the NFT would to be minted
   */
  candyMachineId: anchor.web3.PublicKey;
  /**
   * The public key of the wallet which would pay the gas fees of the transaction
   */
  payer: anchor.web3.PublicKey;
  /**
   * The public key of the end-user
   */
  user: anchor.web3.PublicKey;
  /**
   * Custom RPC URL
   */
  rpc_url?: string;
}

export interface GaslessMintOutput {
  /**
   * The transaction object containing all the required instructions
   */
  transaction: anchor.web3.Transaction;
  /**
   * The blockhash which is being used in the transaction
   */
  blockhash: string;
  /**
   * The last valid block height after which the transaction is declared expired
   */
  lastValidBlockHeight: number;
  /**
   * Array of signers which should be passed while sending the transaction to the network
   */
  signers: Signer[];
  /**
   * The mint keypair which is used to sign the transaction
   */
  mint: anchor.web3.Signer;
}
