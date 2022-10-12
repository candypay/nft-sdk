import React, { FC, useCallback } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, Transaction } from "@solana/web3.js";
import bs58 from "bs58";

import { candypay } from "@candypay/sdk";

export const SendTxnGasless: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const privateKey: string = process.env.NEXT_PUBLIC_PRIVATE_KEY!;

    const payerKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    const payerAddress = payerKeypair.publicKey;
    console.log(payerAddress.toString());
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

    console.log(`https://solscan.io/tx/​${confirmation}​?cluster=devnet}​`);
  }, [publicKey, sendTransaction, connection]);

  return (
    <button
      style={{ margin: "2rem", height: "2rem" }}
      onClick={onClick}
      disabled={!publicKey}
    >
      Send gasless
    </button>
  );
};
