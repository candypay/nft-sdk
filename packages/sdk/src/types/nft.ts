import * as anchor from "@project-serum/anchor";
import { CreatorInput } from "@metaplex-foundation/js";
import { Uses } from "@metaplex-foundation/mpl-token-metadata";

import { Option } from "../utils";

export interface NftAirdropInput {
  /**
   * The public key of the wallet which would pay gas fees of the transaction
   */
  payer: anchor.web3.Keypair;
  /**
   * The public key of user to whom the NFT would be airdropped
   */
  owner: anchor.web3.PublicKey;
  /**
   * The cluster where the transaction would take place i.e either `mainnet-beta`, `devnet` or `testnet`
   */
  network: anchor.web3.Cluster;
  /**
   * The metadata regarding the NFT
   */
  metadata: {
    /**
     * The URI that points to the JSON metadata of the asset.
     */
    uri: string;
    /**
     * The on-chain name of the asset, e.g. "My NFT #123".
     */
    name: string;
    /**
     * The symbol of the NFT
     */
    symbol: string;
    /**
     * The royalties in percent basis point (i.e. 250 is 2.5%) that should be paid to the creators on each secondary sale.
     */
    sellerFeeBasisPoints: number;
    /**
     * This object provides a way of providing creator information when needed, e.g. when creating or updating NFTs, candy machines, etc.
     */
    creators?: CreatorInput[];
    /**
     * The Collection NFT that this new NFT belongs to. When `null`, the created NFT will not be part of a collection.
     */
    collection: Option<anchor.web3.PublicKey>;
    /**
     * When this field is not `null`, it indicates that the NFT can be "used" by its owner or any approved "use authorities".
     */
    uses: Option<Uses>;
  };
  /**
   * Custom RPC URL
   */
  rpc_url?: string;
}

export interface NftAirdropOutput {
  /**
   * The signature of the NFT airdrop transaction
   */
  signature: string;
  /**
   * The accounts related to the NFT airdrop transaction i.e mint account, metadata account, master edition account and token account
   */
  accounts: {
    /**
     * The public key of the mint account
     */
    mint_account: anchor.web3.PublicKey;
    /**
     * The public key of the metadata account
     */
    metadata_account: anchor.web3.PublicKey;
    /**
     * The public key of the master edition account
     */
    master_edition_account: anchor.web3.PublicKey;
    /**
     * The public key of the token account
     */
    token_account: anchor.web3.PublicKey;
  };
  /**
   * The blockhash which is being used in the transaction
   */
  blockhash: string;
  /**
   * The last valid block height after which the transaction is declared expired
   */
  lastValidBlockHeight: number;
}
