import { CandyPay } from "../src";
import * as anchor from "@project-serum/anchor";

describe("mint module", () => {
  test("generate default mint instructions", async () => {
    const sdk = new CandyPay();
    const instructions = await sdk.mint.mint({
      candyMachineID: "GrVSy3ZRbuw5ACbwSEMsj9gULk9MW7QPK1TUYcP6nLM",
      network: "devnet",
      payer: new anchor.web3.PublicKey(
        "3DzHJzPZGBwp7uN5NSMDgQjLAo2qAF78XEMwacmnFDMk"
      ),
    });

    expect(instructions && typeof instructions === "object").toBe(true);
  });

  test("generate gasless mint instructions", async () => {
    const sdk = new CandyPay();
    const instructions = await sdk.mint.gasless({
      candyMachineID: "GrVSy3ZRbuw5ACbwSEMsj9gULk9MW7QPK1TUYcP6nLM",
      network: "devnet",
      payer: new anchor.web3.PublicKey(
        "3DzHJzPZGBwp7uN5NSMDgQjLAo2qAF78XEMwacmnFDMk"
      ),
      user: new anchor.web3.PublicKey(
        "A9H9THrKpxUkusUpLQKmMsmG2eaLi2oR6xxzuPb7Rma2"
      ),
    });

    expect(instructions && typeof instructions === "object").toBe(true);
  });
});
