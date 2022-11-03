import { nftAirdrop } from "../lib";
import { NftAirdropInput } from "../types";

export class Nft {
  async airdrop(options: NftAirdropInput) {
    return await nftAirdrop(options);
  }
}
