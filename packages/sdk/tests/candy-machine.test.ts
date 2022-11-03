import { CandyPay } from "../src";
import * as anchor from "@project-serum/anchor";

import { CANDY_MACHINE_ID, PAYER, USER } from "./fixtures";

jest.setTimeout(100000);

describe("Candy Machine module", () => {
  it("Candy Machine mint", async () => {
    const sdk = new CandyPay();
    const connection = new anchor.web3.Connection(
      "https://metaplex.devnet.rpcpool.com"
    );
    const { transaction, mint } = await sdk.candyMachine.mint({
      candyMachineId: CANDY_MACHINE_ID,
      network: "devnet",
      user: PAYER.publicKey,
    });

    const signature = await anchor.web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [PAYER, mint]
    );
    console.log(signature);

    expect(signature && typeof signature === "string").toBe(true);
  });

  it("Gasless Candy Machine mint", async () => {
    const sdk = new CandyPay();
    const connection = new anchor.web3.Connection(
      "https://metaplex.devnet.rpcpool.com"
    );
    const { transaction, mint } = await sdk.candyMachine.gasless({
      candyMachineId: CANDY_MACHINE_ID,
      network: "devnet",
      payer: PAYER.publicKey,
      user: USER,
    });

    const signature = await anchor.web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [PAYER, mint]
    );
    console.log(signature);

    expect(signature && typeof signature === "string").toBe(true);
  });
});
