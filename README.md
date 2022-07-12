# `@candypay/sdk`

CandyPay SDK lets you effortlessly create NFT minting functions for Candy Machine v2 collections. Simulate minting transactions for multiple use-cases like NFT collection launch, gasless mint and many more on Solana Blockchain!

## Installation 

To install the SDK, run the following command:

```
npm install @candypay/sdk
      or
yarn add @candypay/sdk
```

## Documentation

The SDK currently has two core functions:

- `candypay.mint()`
- `candypay.gasless()`

### `candypay.mint()`

The `candypay.mint()` function would generate required instructions by which user can mint NFTs spending minting costs and gas fees.

**Parameters**:

- `network`: The Candy Machine's network, either `mainnet-beta` or `devnet`.
- `candyMachineID`: The ID of the Candy Machine. The type of this parameter is `string`.
- `payer`: The public key of the user who would pay the gas fees. In the case of this function, it would be the public key of the end-user. The type of this parameter is [`anchor.web3.PublicKey`](https://coral-xyz.github.io/anchor/ts/classes/web3.PublicKey.html)

**Example**:

```js
import { candypay } from "@candypay/sdk";

const ixnArray = await candypay.mint(

      "devnet",

      "GrVSy3ZRbuw5ACbwSEMsj9gULk9MW7QPK1TUYcP6nLM",

      publicKey

    );

const transaction = new Transaction().add(...ixnArray.instructions);

const { blockhash } = await connection.getRecentBlockhash();

transaction.recentBlockhash = blockhash;

transaction.feePayer = publicKey;

transaction.partialSign(ixnArray["mint"]);

const confirmation = await sendTransaction(transaction, connection)

```

Full snippet: https://github.com/candypay/sdk/blob/main/examples/solana-wallet-adapter/components/SendTxnButton.tsx

### `candypay.gasless()`

The `candypay.gasless()` function would generate required instructions by which the user can mint NFTs without paying any gas fees or mint price. Gas fees here will be payed by the developer/platform by passing their keypair.

**Parameters**:

- `network`: The Candy Machine's network, either `mainnet-beta` or `devnet`.
- `candyMachineID`: The ID of the Candy Machine.
- `user`: The public key of the user who would mint the NFTs. In the case of this function, it would be the public key of the end-user. The type of this parameter is [`anchor.web3.PublicKey`](https://coral-xyz.github.io/anchor/ts/classes/web3.PublicKey.html)
- `payer`: The public key of the user who would pay the gas fees for the user. The type of this parameter is [`anchor.web3.PublicKey`](https://coral-xyz.github.io/anchor/ts/classes/web3.PublicKey.html)

**Example**:

```js
import { candypay } from "@candypay/sdk";

const ixnArray = await candypay.gasless(

      "devnet",

      "GrVSy3ZRbuw5ACbwSEMsj9gULk9MW7QPK1TUYcP6nLM",

      payerAddress,

      publicKey

    );

const transaction = new Transaction().add(...ixnArray.instructions);

const { blockhash } = await connection.getRecentBlockhash();

transaction.recentBlockhash = blockhash;

transaction.feePayer = payerAddress;

transaction.partialSign(ixnArray["mint"], payerKeypair);

const confirmation = await sendTransaction(transaction, connection);

```

Full snippet: https://github.com/candypay/sdk/blob/main/examples/solana-wallet-adapter/components/SendTxnGasless.tsx

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
