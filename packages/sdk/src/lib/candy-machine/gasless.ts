import * as anchor from "@project-serum/anchor";

import { initMetaplex } from "../../helpers";
import { rpc } from "../../constants";
import { GaslessMintInput, GaslessMintOutput } from "../../types";

export const gaslessCandyMachineMint = async (
  options: GaslessMintInput
): Promise<GaslessMintOutput> => {
  try {
    const connection = new anchor.web3.Connection(
      rpc.get(options.network) || options.rpc_url!
    );
    const metaplex = await initMetaplex({
      connection,
      guest_mode: true,
      guest_public_key: options.payer,
    });

    const candyMachine = await metaplex.candyMachinesV2().findByAddress({
      address: options.candyMachineId,
    });
    const transactionBuilder = await metaplex
      .candyMachinesV2()
      .builders()
      .mint({
        candyMachine,
        newOwner: options.user,
      });

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    const transaction = transactionBuilder.toTransaction({
      blockhash,
      lastValidBlockHeight,
    });

    return {
      transaction,
      blockhash,
      lastValidBlockHeight,
      signers: transactionBuilder.getSigners(),
      mint: transactionBuilder.getContext().mintSigner as anchor.web3.Signer,
    };
  } catch (err) {
    throw new Error(err);
  }
};
