import { candyMachineMint, gaslessMint } from "../lib";
import { CandyMachineMintOptions, GaslessMintOptions } from "../types";

export class Mint {
  /**
   * @description Returns instructions array for minting NFT the default way
   * @param {CandyMachineMintOptions} options - CandyMachineMintOptions
   * @returns The instructions array and mint keypair
   */
  async mint(options: CandyMachineMintOptions) {
    return await candyMachineMint(options);
  }

  /**
   * @description Returns instructions array for minting NFT the gasless way
   * @param {GaslessMintOptions} options - GaslessMintOptions
   * @returns The instructions array and mint keypair
   */
  async gasless(options: GaslessMintOptions) {
    return await gaslessMint(options);
  }
}
