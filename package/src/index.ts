import * as anchor from "@project-serum/anchor";

import { mint, gasless } from "./modules/mint";

import { CandyMachineNetworks } from "./types/index.d";

export class candypay {
  /**
   * @description The default way of minting NFTs via QR code, the user would need to pay the gas fees
   * @param network - The network on which the Candy Machine exists. Either `mainnet-beta` or `devnet`
   * @param candyMachineID - The ID of the Candy Machine
   * @param payer - The public key of the wallet which would pay the gas fees
   */

  static async mint(
    network: CandyMachineNetworks,
    candyMachineID: string,
    payer: anchor.web3.PublicKey
  ) {
    return await mint(network, candyMachineID, payer);
  }

  /**
   * @description A gasless way of minting NFTs via QR code
   * @param network - The network on which the Candy Machine exists. Either `mainnet-beta` or `devnet`
   * @param candyMachineID - The ID of the Candy Machine
   * @param payer - The public key of the wallet which would pay the gas fees
   * @param user - The public key of the wallet which would mint the NFTs
   */

  static async gasless(
    network: CandyMachineNetworks,
    candyMachineID: string,
    payer: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey
  ) {
    return await gasless(network, candyMachineID, payer, user);
  }
}
