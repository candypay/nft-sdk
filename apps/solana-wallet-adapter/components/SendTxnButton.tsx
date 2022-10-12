import React, { FC, useCallback } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";

import { candypay } from "@candypay/sdk";

export const SendTxnButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

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

    const confirmation = await sendTransaction(transaction, connection);

    console.log(`https://solscan.io/tx/​${confirmation}​?cluster=devnet}​`);
  }, [publicKey, sendTransaction, connection]);

  return (
    <button
      style={{ margin: "2rem", height: "2rem" }}
      onClick={onClick}
      disabled={!publicKey}
    >
      Send Normal
    </button>
  );
};
