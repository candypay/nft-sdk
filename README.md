# `@candypay/sdk`

CandyPay SDK lets you effortlessly create NFT minting functions for Candy Machine v2 collections. Simulate minting transactions for multiple use-cases like NFT collection launch, gasless mint and many more on Solana Blockchain!

## Installtion

```bash
npm install @candypay/sdk @project-serum/anchor
```

## Setup

The entry point to the SDK is a `CandyPay` instance that will give you access to its API.

```ts
import { CandyPay } from "@candypay/sdk";

const candypay = new CandyPay();
```

## Mint module

The `mint` module can be accessed via `candypay.mint()` and provides the following methods:

- [mint](#mint)
- [gasless](#gasless)

### `mint`

The `mint` method allows you to generate instructions for minting a Candy Machine v2 in the default way, where the end-user would pay the gas fees.

**Parameters**:

- `network`: The cluster where the Candy Machine has been deployed i.e either `mainnet-beta` or `devnet`
- `candyMachineID`: The ID of the Candy Machine
- `payer`: The public key of the end-user

**Response**:

- `instructions`: An array of instructions required for gasless minting of the Candy Machine
- `mint`: Mint keypair of the NFT

**Example**:

```ts
import { CandyPay } from "@candypay/sdk";
import * as anchor from "@project-serum/anchor";

const candypay = new CandyPay();
const payer = new anchor.web3.PublicKey(
  "3DzHJzPZGBwp7uN5NSMDgQjLAo2qAF78XEMwacmnFDMk"
);

const { instructions, mint } = await candypay.mint.mint({
  candyMachineID: "GrVSy3ZRbuw5ACbwSEMsj9gULk9MW7QPK1TUYcP6nLM",
  network: "devnet",
  payer,
});
```

### `gasless`

The `gasless` method allows you to generate instructions for minting a Candy Machine v2 in the gasless way, where the end-user doesn't need pay the gas fees.

**Parameters**:

- `network`: The cluster where the Candy Machine has been deployed i.e either `mainnet-beta` or `devnet`
- `candyMachineID`: The ID of the Candy Machine
- `payer`: The public key of the wallet who would fund the gas fees
- `user`: The public key of the end-user

**Response**:

- `instructions`: An array of instructions required for gasless minting of the Candy Machine
- `mint`: Mint keypair of the NFT

**Example**:

```ts
import { CandyPay } from "@candypay/sdk";
import * as anchor from "@project-serum/anchor";

const candypay = new CandyPay();
const payer = new anchor.web3.PublicKey(
  "A9H9THrKpxUkusUpLQKmMsmG2eaLi2oR6xxzuPb7Rma2"
);
const user = new anchor.web3.PublicKey(
  "3DzHJzPZGBwp7uN5NSMDgQjLAo2qAF78XEMwacmnFDMk"
);

const { instructions, mint } = await candypay.mint.gasless({
  candyMachineID: "GrVSy3ZRbuw5ACbwSEMsj9gULk9MW7QPK1TUYcP6nLM",
  network: "devnet",
  payer,
  user,
});
```

## NFT module

The `nft` module can be accessed via `candypay.nft()` and provides the following methods:

- [`airdrop`](#airdrop)

### airdrop

The `airdrop` method allows you to airdrop certain NFT without having to create a NFT beforehand.

**Parameters**:

- `network` - The cluster where the transaction would be simulated i.e either `mainnet-beta`, `devnet` or `testnet`
- `payer` - The public key of the wallet which would fund the gas fees of the transaction
- `owner` - The public key of the user to whom the NFT would be airdropped
- `metadata` - Metadata of the NFT

**Response**:

- `signature` - Signature of the transaction
- `mint` - Mint keypair of the NFT
- `blockhash` - Blockhash which was used for the transaction

**Example**:

```ts
import { CandyPay } from "@candypay/sdk";
import * as anchor from "@project-serum/anchor";
import dotenv from "dotenv";
import base58 from "bs58";

dotenv.config();

const candypay = new CandyPay();
const payer = anchor.web3.Keypair.fromSecretKey(
  base58.decode(process.env.PAYER_SECRET_KEY!)
);

try {
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
} catch (err) {
  console.log(err);
}
```

## Using the SDK with Next.js

Using our SDK with Next.js can sometimes run in build time error cause of [Anchor](https://npmjs.com/package/@project-serum/anchor) library using the node native "fs" module. We highly recommend adding this export in `next.config.js` file before deployment:

```js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};
```

## Get in Touch

- Twitter: [@candypayfun](https://twitter.com/candypayfun)
- Website: [candypay.fun](https://candypay.fun)
