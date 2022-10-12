import * as anchor from "@project-serum/anchor";
import { MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import {
  createAssociatedTokenAccountInstruction,
  getAtaForMint,
  getCandyMachineState,
  getMasterEdition,
  getMetadata,
  getNetworkExpire,
  getNetworkToken,
  getCandyMachineCreator,
} from "../utils";
import { CIVIC, TOKEN_METADATA_PROGRAM_ID, rpc } from "../constants";
import { CandyMachineAccount, GaslessMintOptions } from "../types";

export const gaslessMint = async (
  options: GaslessMintOptions
): Promise<{
  instructions: anchor.web3.TransactionInstruction[];
  mint: anchor.web3.Keypair;
}> => {
  if (!anchor.web3.PublicKey.isOnCurve(options.payer)) {
    throw new Error("Invalid payer address");
  }

  if (!anchor.web3.PublicKey.isOnCurve(options.user)) {
    throw new Error("Invalid user address");
  }

  const mint = anchor.web3.Keypair.generate();
  const dummyKeypair = new anchor.web3.Keypair();
  const walletWrapper = new anchor.Wallet(dummyKeypair);

  const candyMachine: CandyMachineAccount = await getCandyMachineState(
    walletWrapper,
    new anchor.web3.PublicKey(options.candyMachineID),
    new anchor.web3.Connection(rpc.get(options.network)!)
  );

  const candyMachineAddress = candyMachine.id;

  const userTokenAccountAddress = (
    await getAtaForMint(mint.publicKey, options.user)
  )[0];

  const userPayingAccountAddress = options.payer;
  const instructions: anchor.web3.TransactionInstruction[] = [];
  const remainingAccounts = [];
  const signers: anchor.web3.Keypair[] = [];

  if (mint) {
    signers.push(mint);
    instructions.push(
      ...[
        anchor.web3.SystemProgram.createAccount({
          fromPubkey: options.payer,
          newAccountPubkey: mint.publicKey,
          space: MintLayout.span,
          lamports:
            await candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(
              MintLayout.span
            ),
          programId: TOKEN_PROGRAM_ID,
        }),
        Token.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          0,
          options.user,
          options.user
        ),
        createAssociatedTokenAccountInstruction(
          userTokenAccountAddress,
          options.payer,
          options.user,
          mint.publicKey
        ),
        Token.createMintToInstruction(
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          userTokenAccountAddress,
          options.user,
          [],
          1
        ),
      ]
    );
  }

  if (candyMachine.state.gatekeeper) {
    remainingAccounts.push({
      pubkey: (
        await getNetworkToken(
          options.payer,
          candyMachine.state.gatekeeper.gatekeeperNetwork
        )
      )[0],
      isWritable: true,
      isSigner: false,
    });

    if (candyMachine.state.gatekeeper.expireOnUse) {
      remainingAccounts.push({
        pubkey: CIVIC,
        isWritable: false,
        isSigner: false,
      });
      remainingAccounts.push({
        pubkey: (
          await getNetworkExpire(
            candyMachine.state.gatekeeper.gatekeeperNetwork
          )
        )[0],
        isWritable: false,
        isSigner: false,
      });
    }
  }

  if (candyMachine.state.whitelistMintSettings) {
    const mint = new anchor.web3.PublicKey(
      candyMachine.state.whitelistMintSettings.mint
    );

    const whitelistToken = (await getAtaForMint(mint, options.payer))[0];
    remainingAccounts.push({
      pubkey: whitelistToken,
      isWritable: true,
      isSigner: false,
    });

    if (candyMachine.state.whitelistMintSettings.mode.burnEveryTime) {
      remainingAccounts.push({
        pubkey: mint,
        isWritable: true,
        isSigner: false,
      });
      remainingAccounts.push({
        pubkey: options.payer,
        isWritable: false,
        isSigner: true,
      });
    }
  }

  if (candyMachine.state.tokenMint) {
    remainingAccounts.push({
      pubkey: userPayingAccountAddress,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: options.payer,
      isWritable: false,
      isSigner: true,
    });
  }
  const metadataAddress = await getMetadata(mint.publicKey);
  const masterEdition = await getMasterEdition(mint.publicKey);

  const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(
    candyMachineAddress
  );

  instructions.push(
    await candyMachine.program.instruction.mintNft(creatorBump, {
      accounts: {
        candyMachine: candyMachineAddress,
        candyMachineCreator,
        payer: options.payer,
        wallet: candyMachine.state.treasury,
        mint: mint.publicKey,
        metadata: metadataAddress,
        masterEdition,
        mintAuthority: options.user,
        updateAuthority: options.user,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        recentBlockhashes: anchor.web3.SYSVAR_SLOT_HASHES_PUBKEY,
        instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      remainingAccounts:
        remainingAccounts.length > 0 ? remainingAccounts : undefined,
    })
  );

  return {
    instructions,
    mint,
  };
};
