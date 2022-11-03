import { CandyMachine, Nft } from "./modules";

export class CandyPay {
  public candyMachine: CandyMachine;
  public nft: Nft;

  constructor() {
    this.candyMachine = new CandyMachine();
    this.nft = new Nft();
  }
}
