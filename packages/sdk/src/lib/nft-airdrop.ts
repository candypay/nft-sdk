import * as anchor from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "solana-spl-token";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

import { TOKEN_METADATA_PROGRAM_ID } from "../constants";
import { NftAirdropOptions } from "../types";

export const nftAirdrop = async (
  options: NftAirdropOptions
): Promise<{
  signature: string;
  mint: anchor.web3.Keypair;
  blockhash: string;
}> => {
  try {
    const mint = anchor.web3.Keypair.generate();
    const wallet = new anchor.Wallet(options.payer);
    const connection = new anchor.web3.Connection(
      options.rpc_url || anchor.web3.clusterApiUrl(options.network)
    );
    const lamports = await connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );
    const payerAta = await getAssociatedTokenAddress(
      mint.publicKey,
      options.payer.publicKey
    );
    const ownerAta = await getAssociatedTokenAddress(
      mint.publicKey,
      options.owner
    );

    const [metadatakey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [masterKey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const args = {
      data: options.metadata,
      isMutable: true,
    };

    const instructions: anchor.web3.TransactionInstruction[] = [];

    instructions.push(
      ...[
        anchor.web3.SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mint.publicKey,
          0,
          options.payer.publicKey,
          null
        ),
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          payerAta,
          options.payer.publicKey,
          mint.publicKey
        ),
        createMintToInstruction(
          mint.publicKey,
          payerAta,
          options.payer.publicKey,
          1
        ),
      ]
    );

    const createMetadataV2 = createCreateMetadataAccountV2Instruction(
      {
        metadata: metadatakey,
        mint: mint.publicKey,
        mintAuthority: options.payer.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      },
      {
        createMetadataAccountArgsV2: args,
      }
    );

    instructions.push(createMetadataV2);

    const createMasterEditionV3 = createCreateMasterEditionV3Instruction(
      {
        edition: masterKey,
        mint: mint.publicKey,
        updateAuthority: wallet.publicKey,
        mintAuthority: options.payer.publicKey,
        payer: wallet.publicKey,
        metadata: metadatakey,
      },
      {
        createMasterEditionArgs: {
          maxSupply: new anchor.BN(0),
        },
      }
    );

    instructions.push(createMasterEditionV3);

    const createAtaInstruction = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      ownerAta,
      options.owner,
      options.payer.publicKey
    );

    instructions.push(createAtaInstruction);

    const transferInstruction = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      payerAta,
      ownerAta,
      options.payer.publicKey,
      [],
      1
    );

    instructions.push(transferInstruction);

    const { blockhash } = await connection.getLatestBlockhash("finalized");
    const transaction = new anchor.web3.Transaction({
      recentBlockhash: blockhash,
      feePayer: wallet.publicKey,
    });

    transaction.add(...instructions);
    transaction.sign(mint, options.payer);
    const signature = await anchor.web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [options.payer, mint]
    );

    return {
      signature,
      mint,
      blockhash,
    };
  } catch (err) {
    throw new Error(err);
  }
};
