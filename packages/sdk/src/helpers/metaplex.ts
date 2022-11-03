import {
  guestIdentity,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js";
import * as anchor from "@project-serum/anchor";

interface InitMetaplexOptions {
  connection: anchor.web3.Connection;
  guest_mode: boolean;
  keypair?: anchor.web3.Keypair;
  guest_public_key?: anchor.web3.PublicKey;
}

export const initMetaplex = async (options: InitMetaplexOptions) => {
  const metaplex = new Metaplex(options.connection);
  return options.guest_mode === true
    ? metaplex.use(guestIdentity(options.guest_public_key))
    : metaplex.use(keypairIdentity(options.keypair!));
};
