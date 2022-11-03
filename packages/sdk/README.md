# `@candypay/sdk`

CandyPay SDK lets you effortlessly create NFT minting functions for Candy Machine v2 collections. Simulate minting transactions for multiple use-cases like NFT collection launch, gasless mint and many more on Solana Blockchain!

## Installation

```bash
npm install @candypay/sdk @project-serum/anchor
```

## Setup

The entry point to the SDK is a `CandyPay` instance that will give you access to its API.

```ts
import { CandyPay } from "@candypay/sdk";

const candypay = new CandyPay();
```

## Candy Machine module

The `candyMachine` module can be accessed via `candypay.candyMachine()` and provides the following methods:

- [mint](#mint)
- [gasless](#gasless)

### `mint`

The `mint` method returns the transaction object with the all the required instructions for minting a Candy Machine v2 in the default way, where the end-user would pay the gas fees.

**Parameters**:

- `network`: The cluster where the transaction would take place i.e either `mainnet-beta` or `devnet`
- `candyMachineId`: The address of the Candy Machine
- `user`: The public key of the end-user
- `rpc_url` (optional): Custom RPC URL

**Response**:

- `transaction`: The transaction object containing all the required instructions
- `blockhash`: Blockhash which is being used in the transaction
- `lastValidBlockHeight`: The last valid block height after which the transaction is declared expired
- `signers`: Array of signers which should be passed while sending the transaction to the network
- `mint`: The mint keypair which is used to sign the transaction

**Example**:

```ts
import { CandyPay } from "@candypay/sdk";
import * as anchor from "@project-serum/anchor";
import dotenv from "dotenv";
import base58 from "bs58";

dotenv.config();

const sdk = new CandyPay();
const connection = new anchor.web3.Connection(
  "https://metaplex.devnet.rpcpool.com"
);

const CANDY_MACHINE_ID = new anchor.web3.PublicKey(
  "GrVSy3ZRbuw5ACbwSEMsj9gULk9MW7QPK1TUYcP6nLM"
);
const PAYER = anchor.web3.Keypair.fromSecretKey(
  base58.decode(process.env.PAYER_SECRET_KEY!)
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

console.log(`Signature - ${signature}`);
```

### `gasless`

The `gasless` method returns the transaction object with the all the required instructions for minting a Candy Machine v2 in the gasless way, where the end-user doesn't need pay the gas fees.

**Parameters**:

- `network`: The cluster where the transaction would take place i.e either `mainnet-beta` or `devnet`
- `candyMachineId`: The address of the Candy Machine from which the NFT would to be minted
- `payer`: The public key of the wallet which would pay the gas fees of the transaction
- `user`: The public key of the end-user
- `rpc_url` (optional): Custom RPC URL

**Response**:

- `transaction`: The transaction object containing all the required instructions
- `blockhash`: The blockhash which is being used in the transaction
- `lastValidBlockHeight`: The last valid block height after which the transaction is declared expired
- `signers`: Array of signers which should be passed while sending the transaction to the network
- `mint`: The mint keypair which is used to sign the transaction

**Example**:

```ts
import { CandyPay } from "@candypay/sdk";
import * as anchor from "@project-serum/anchor";
import dotenv from "dotenv";
import base58 from "bs58";

dotenv.config();

const sdk = new CandyPay();
const connection = new anchor.web3.Connection(
  "https://metaplex.devnet.rpcpool.com"
);

const CANDY_MACHINE_ID = new anchor.web3.PublicKey(
  "GrVSy3ZRbuw5ACbwSEMsj9gULk9MW7QPK1TUYcP6nLM"
);
const PAYER = anchor.web3.Keypair.fromSecretKey(
  base58.decode(process.env.PAYER_SECRET_KEY!)
);
const USER = new anchor.web3.PublicKey(
  "2S9jKJEGKoVxR3xkEfFyGVrLwJj1H8xYjqtSP5LAX97x"
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

console.log(`Signature - ${signature}`);
```

## NFT module

The `nft` module can be accessed via `candypay.nft()` and provides the following methods:

- [`airdrop`](#airdrop)

### airdrop

The `airdrop` method allows you to airdrop certain NFT without having to create an NFT beforehand.

**Parameters**:

- `payer`: The public key of the wallet which would pay gas fees of the transaction
- `owner`: The public key of user to whom the NFT would be airdropped
- `network`: The cluster where the transaction would take place i.e either `mainnet-beta`, `devnet` or `testnet`
- `metadata`: The metadata regarding the NFT
- `rpc_url`: Custom RPC URL

**Response**:

- `signature`: The signature of the NFT airdrop transaction
- `accounts`: The accounts related to the NFT airdrop transaction i.e mint account, metadata account, master edition account and token account
- `blockhash`: The blockhash which is being used in the transaction

**Example**:

```ts
import { CandyPay } from "@candypay/sdk";
import * as anchor from "@project-serum/anchor";
import dotenv from "dotenv";
import base58 from "bs58";

dotenv.config();

const sdk = new CandyPay();

const PAYER = anchor.web3.Keypair.fromSecretKey(
  base58.decode(process.env.PAYER_SECRET_KEY!)
);
const USER = new anchor.web3.PublicKey(
  "2S9jKJEGKoVxR3xkEfFyGVrLwJj1H8xYjqtSP5LAX97x"
);

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

console.log(`Signature - ${signature}`);
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
- Discord: [Join Now](https://discord.com/invite/VGjPXWUHGT)
- Email: [hello@candypay.fun](mailto:hello@candypay.fun)
