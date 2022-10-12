import { nftAirdrop } from "../lib";
import { NftAirdropOptions } from "../types";

export class Nft {
  /**
   * @description Airdrop an NFT to a specific wallet address via the NFT's metadata
   * @param {NftAirdropOptions} options - NftAirdropOptions
   * @returns The signature of the transaction, mint keypair of the NFT and blockhash
   */
  async airdrop(options: NftAirdropOptions) {
    return await nftAirdrop(options);
  }
}
