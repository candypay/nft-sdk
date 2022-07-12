import * as anchor from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_SLOT_HASHES_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { MintLayout, TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

import {
  getCandyMachineState,
  getAtaForMint,
  createAssociatedTokenAccountInstruction,
  getNetworkToken,
  getNetworkExpire,
  getMetadata,
  getMasterEdition,
  getCandyMachineCreator,
  getCollectionPDA,
  CollectionData,
  getCollectionAuthorityRecordPDA,
} from "../../lib/candyMachine";

import {
  CIVIC,
  RPC_URLS,
  TOKEN_METADATA_PROGRAM_ID,
} from "../../common/constants";

import { CandyMachineNetworks } from "../../types/index.d";

const mint = async (
  network: CandyMachineNetworks,
  candyMachineID: string,
  payer: anchor.web3.PublicKey
): Promise<{
  instructions: TransactionInstruction[];
  mint: anchor.web3.Keypair;
}> => {
  if (!PublicKey.isOnCurve(payer)) {
    throw new Error("Invalid payer address");
  }

  const reference = Keypair.generate().publicKey;
  const dummyKeypair = new anchor.web3.Keypair();
  const walletWrapper = new anchor.Wallet(dummyKeypair);

  const candyMachine = await getCandyMachineState(
    walletWrapper,
    new anchor.web3.PublicKey(candyMachineID),
    new anchor.web3.Connection(RPC_URLS.get(network)!)
  );

  const candyMachineAddress = candyMachine.id;

  const mint = new anchor.web3.Keypair();

  const userTokenAccountAddress = (
    await getAtaForMint(mint.publicKey, payer)
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
          payer,
          payer
        ),
        createAssociatedTokenAccountInstruction(
          userTokenAccountAddress,
          payer,
          payer,
          mint.publicKey
        ),
        Token.createMintToInstruction(
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          userTokenAccountAddress,
          payer,
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
        mintAuthority: payer,
        updateAuthority: payer,
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
  const [collectionPDA] = await getCollectionPDA(candyMachineAddress);
  const collectionPDAAccount =
    await candyMachine.program.provider.connection.getAccountInfo(
      collectionPDA
    );

  if (collectionPDAAccount && candyMachine.state.retainAuthority) {
    try {
      const collectionData =
        (await candyMachine.program.account.collectionPda.fetch(
          collectionPDA
        )) as CollectionData;

      const collectionMint = collectionData.mint;
      const collectionAuthorityRecord = await getCollectionAuthorityRecordPDA(
        collectionMint,
        collectionPDA
      );

      if (collectionMint) {
        const collectionMetadata = await getMetadata(collectionMint);
        const collectionMasterEdition = await getMasterEdition(collectionMint);

        const setCollectionInst =
          await candyMachine.program.instruction.setCollectionDuringMint({
            accounts: {
              candyMachine: candyMachineAddress,
              metadata: metadataAddress,
              payer: payer,
              collectionPda: collectionPDA,
              tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
              instructions: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
              collectionMint,
              collectionMetadata,
              collectionMasterEdition,
              authority: candyMachine.state.authority,
              collectionAuthorityRecord,
            },
          });

        setCollectionInst.keys.push({
          pubkey: new PublicKey(reference),
          isSigner: false,
          isWritable: false,
        });

        instructions.push(setCollectionInst);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  return {
    instructions,
    mint,
  };
};

export default mint;
