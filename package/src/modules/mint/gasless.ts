import * as anchor from "@project-serum/anchor";
import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_SLOT_HASHES_PUBKEY,
} from "@solana/web3.js";
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
} from "../../lib/candyMachine";

import {
  CIVIC,
  RPC_URLS,
  TOKEN_METADATA_PROGRAM_ID,
} from "../../common/constants";

import { CandyMachineNetworks } from "../../types/index.d";
import { CandyMachineAccount } from "../../types/index.d";

const gasless = async (
  network: CandyMachineNetworks,
  candyMachineID: string,
  payer: anchor.web3.PublicKey,
  user: anchor.web3.PublicKey
): Promise<{
  instructions: TransactionInstruction[];
  mint: anchor.web3.Keypair;
}> => {
  if (!PublicKey.isOnCurve(payer)) {
    throw new Error("Invalid payer address");
  }

  if (!PublicKey.isOnCurve(user)) {
    throw new Error("Invalid user address");
  }

  const mint = anchor.web3.Keypair.generate();
  const dummyKeypair = new anchor.web3.Keypair();
  const walletWrapper = new anchor.Wallet(dummyKeypair);

  const candyMachine: CandyMachineAccount = await getCandyMachineState(
    walletWrapper,
    new anchor.web3.PublicKey(candyMachineID),
    new anchor.web3.Connection(RPC_URLS.get(network)!)
  );

  const candyMachineAddress = candyMachine.id;

  const userTokenAccountAddress = (
    await getAtaForMint(mint.publicKey, user)
  )[0];

  const userPayingAccountAddress = payer;
  const instructions: TransactionInstruction[] = [];
  const remainingAccounts = [];
  const signers: anchor.web3.Keypair[] = [];

  if (mint) {
    signers.push(mint);
    instructions.push(
      ...[
        anchor.web3.SystemProgram.createAccount({
          fromPubkey: payer,
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
          user,
          user
        ),
        createAssociatedTokenAccountInstruction(
          userTokenAccountAddress,
          payer,
          user,
          mint.publicKey
        ),
        Token.createMintToInstruction(
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          userTokenAccountAddress,
          user,
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
          payer,
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

    const whitelistToken = (await getAtaForMint(mint, payer))[0];
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
        pubkey: payer,
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
      pubkey: payer,
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
        payer: payer,
        wallet: candyMachine.state.treasury,
        mint: mint.publicKey,
        metadata: metadataAddress,
        masterEdition,
        mintAuthority: user,
        updateAuthority: user,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        recentBlockhashes: SYSVAR_SLOT_HASHES_PUBKEY,
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

export default gasless;
