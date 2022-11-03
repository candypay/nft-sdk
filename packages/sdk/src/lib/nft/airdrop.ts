import * as anchor from "@project-serum/anchor";

import { initMetaplex } from "../../helpers";
import { rpc } from "../../constants";
import { NftAirdropInput, NftAirdropOutput } from "../../types";

export const nftAirdrop = async (
  options: NftAirdropInput
): Promise<NftAirdropOutput> => {
  try {
    const connection = new anchor.web3.Connection(
      rpc.get(options.network) || options.rpc_url!
    );
    const metaplex = await initMetaplex({
      connection,
      guest_mode: false,
      keypair: options.payer,
    });

    const transaction = await metaplex.nfts().create({
      ...options.metadata,
      tokenOwner: options.owner,
    });

    return {
      signature: transaction.response.signature,
      accounts: {
        mint_account: transaction.mintAddress,
        token_account: transaction.tokenAddress,
        metadata_account: transaction.metadataAddress,
        master_edition_account: transaction.masterEditionAddress,
      },
      blockhash: transaction.response.blockhash,
      lastValidBlockHeight: transaction.response.lastValidBlockHeight,
    };
  } catch (err) {
    throw new Error(err);
  }
};
