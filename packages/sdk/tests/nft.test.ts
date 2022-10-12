import { CandyPay } from "../src";
import * as anchor from "@project-serum/anchor";
import dotenv from "dotenv";
import base58 from "bs58";

dotenv.config();

jest.setTimeout(100000);

describe("nft module", () => {
  test("nft airdrop", async () => {
    const payer = anchor.web3.Keypair.fromSecretKey(
      base58.decode(process.env.PAYER_SECRET_KEY!)
    );
    const sdk = new CandyPay();

    const { signature } = await sdk.nft.airdrop({
      network: "devnet",
      payer,
      owner: new anchor.web3.PublicKey(
        "A9H9THrKpxUkusUpLQKmMsmG2eaLi2oR6xxzuPb7Rma2"
      ),
      metadata: {
        name: "DeGod",
        uri: "https://metadata.degods.com/g/4924.json",
        symbol: "DEGOD",
        collection: null,
        sellerFeeBasisPoints: 1000,
        creators: [
          {
            address: payer.publicKey,
            verified: true,
            share: 100,
          },
        ],
        uses: null,
      },
    });

    expect(signature && typeof signature === "string").toBe(true);
  });
});
