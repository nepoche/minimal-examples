// A Vault Relayer connects listens to events on the chains
// and relays the relevant events to the neighbor vaults.

import { ethers } from 'ethers';
import { LocalChain } from './LocalChain';

export class VaultRelayer {
  private chains: LocalChain[];
  private signer: ethers.Signer;

  private constructor (chains: LocalChain[], signer: ethers.Signer) {
    this.chains = chains;
    this.signer = signer;
  }

  static async startupRelayer(chains: LocalChain[], signer: ethers.Signer): Promise<VaultRelayer> {
    // Setup the event listeners and processes for each chain
    const relayer = new VaultRelayer(chains, signer);

    for (let i=0; i<relayer.chains.length; i++) {
      const chainVault = relayer.chains[i].getVault();
      if (!chainVault) {
        throw new Error("Can't relay for a chain that doesn't have a deployed vault");
      }
    }
  }

  async setupAnchorEventListener(chain: LocalChain) {

  }

}
