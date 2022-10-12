import { Mint, Nft } from "./modules";

export class CandyPay {
  public mint: Mint;
  public nft: Nft;

  constructor() {
    this.mint = new Mint();
    this.nft = new Nft();
  }
}
