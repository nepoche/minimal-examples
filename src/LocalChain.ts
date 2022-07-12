/*
 * Copyright 2022 Webb Technologies Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { ethers } from 'ethers';
import { Server } from 'ganache';
import { startGanacheServer } from './startGanacheServer';
import { EventKind, ExampleVault } from './ExampleVault';

export type GanacheAccounts = {
  balance: string;
  secretKey: string;
};

export type LocalChainOpts = {
  name: string;
  port: number;
  chainId: number;
  populatedAccounts: GanacheAccounts[];
};

export class LocalChain {
  public readonly endpoint: string;
  readonly #server: Server<'ethereum'>;
  #vault: ExampleVault | undefined;
  constructor(private readonly opts: LocalChainOpts) {
    this.endpoint = `http://127.0.0.1:${opts.port}`;
    this.#server = startGanacheServer(
      opts.port,
      opts.chainId,
      opts.populatedAccounts,
    );
  }

  public get name(): string {
    return this.opts.name;
  }

  public get chainId(): number {
    return this.opts.chainId;
  }

  public provider(): ethers.providers.WebSocketProvider {
    return new ethers.providers.WebSocketProvider(this.endpoint, {
      name: this.opts.name,
      chainId: this.chainId,
    });
  }

  public async stop() {
    await this.#server.close();
  }

  public getVault() {
    return this.#vault;
  }

  public async deployVault(
    wallet: ethers.Wallet
  ): Promise<ExampleVault> {
    const vault = await ExampleVault.deployVault(wallet);
    this.#vault = vault;
    return vault;
  }

  public async registerListener(event: EventKind, listener: () => void) {
    if (!this.#vault) return;
    
    this.#vault.registerListener(event, listener);
  }
}

