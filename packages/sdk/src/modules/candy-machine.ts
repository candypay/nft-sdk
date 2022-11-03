import { candyMachineMint, gaslessCandyMachineMint } from "../lib";
import { CandyMachineMintInput, GaslessMintInput } from "../types";

export class CandyMachine {
  async mint(options: CandyMachineMintInput) {
    return await candyMachineMint(options);
  }

  async gasless(options: GaslessMintInput) {
    return await gaslessCandyMachineMint(options);
  }
}
