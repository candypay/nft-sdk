import { CandyPay } from "../src";

import { PAYER, USER } from "./fixtures";

jest.setTimeout(100000);

describe("NFT module", () => {
  it("Airdrop NFT", async () => {
    const sdk = new CandyPay();
    const { signature } = await sdk.nft.airdrop({
      metadata: {
        name: "DeGod",
        uri: "https://metadata.degods.com/g/4924.json",
        symbol: "DEGOD",
        collection: null,
        sellerFeeBasisPoints: 1000,
        creators: [
          {
            address: PAYER.publicKey,
            share: 100,
          },
        ],
        uses: null,
      },
      network: "devnet",
      owner: USER,
      payer: PAYER,
    });

    console.log(signature);

    expect(signature && typeof signature === "string").toBe(true);
  });
});
