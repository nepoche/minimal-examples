import { ethers } from 'ethers';
import { ExampleVault as ExampleVaultContract, ExampleVault__factory } from '../typechain-types';
import { EventEmitter } from 'events';

export type EventKind =
  | 'Insertion'
  | 'NeighborUpdate'
  | 'NeighborAddition'
;

export class ExampleVault {
  contract: ExampleVaultContract;
  #eventEmitter = new EventEmitter();
  signer: ethers.Signer;

  constructor(
    contract: ExampleVaultContract,
    signer: ethers.Signer,
  ) {
    this.contract = contract;
    this.signer = signer;
  }

  public static async deployVault(creator: ethers.Signer) {
    const factory = new ExampleVault__factory(creator);
    const vault = await factory.deploy();
    await vault.deployed();
    const exampleVault = new ExampleVault(vault, creator);
    exampleVault.setupVaultEventHandling();
    return exampleVault;
  }

  public static async vaultFromAddress(contract: string, signer: ethers.Signer) {
    const vault = ExampleVault__factory.connect(contract, signer);
    return new ExampleVault(vault, signer);
  }

  public getVaultValue(): Promise<number> {
    return this.contract.value();
  }

  public async updateValue(value: number): Promise<void> {
    const tx = await this.contract.insert(value);
    await tx.wait();
  }

  public async updateNeighborValue(chainID: number, neighborValue: number): Promise<void> {
    const tx = await this.contract.updateNeighbor(chainID, neighborValue);
    await tx.wait();
  }

  public setupVaultEventHandling() {
    this.contract.on(this.contract.filters.Insertion(), (index, value) => {
      this.#eventEmitter.emit('Insertion', [index, value]);
    })

    this.contract.on(this.contract.filters.NeighborAddition(), (chainID, index, value) => {
      this.#eventEmitter.emit('NeighborAddition', [chainID, index, value]);
    })

    this.contract.on(this.contract.filters.NeighborUpdate(), (chainID, index, value) => {
      this.#eventEmitter.emit('NeighborUpdate', [chainID, index, value]);
    })
  }

  public registerListener(event: EventKind, listener: () => void) {
    this.#eventEmitter.prependListener(event, listener);
  }
}

