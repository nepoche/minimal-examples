import { startGanacheServer } from '../startGanacheServer';
import { MintableToken } from '@webb-tools/tokens';
import { ethers } from 'ethers';

let deployerPrivateKey =
  '0xc0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e';
  let senderAddress = '0x42f620334F6415BB437C1c041DA24653A073405b';
  let senderPrivateKey =
    '0xc0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d72';
let chainId1 = 3333;
let ganacheServer1: any;
let provider1: ethers.providers.Provider;

let chainId2 = 4444;
let ganacheServer2: any;
let provider2: ethers.providers.Provider;

let tokenInstance1: MintableToken;
let tokenInstance2: MintableToken;

describe('Two chain tests', function () {
  this.timeout(100_000);
  before(async function () {
    let ganacheAccounts = [
      {
        balance: ethers.utils.parseEther('1000').toHexString(),
        secretKey: deployerPrivateKey,
      },
      {
        balance: ethers.utils.parseEther('1000').toHexString(),
        secretKey: senderPrivateKey,
      },
    ];

    ganacheServer1 = startGanacheServer(3333, chainId1, ganacheAccounts);
    provider1 = new ethers.providers.WebSocketProvider('http://localhost:3333');

    ganacheServer2 = startGanacheServer(4444, chainId2, ganacheAccounts);
    provider2 = new ethers.providers.WebSocketProvider('http://localhost:4444');

    // Deploy token contracts
    const wallet1 = new ethers.Wallet(deployerPrivateKey, provider1);
    const wallet2 = new ethers.Wallet(deployerPrivateKey, provider2);

    tokenInstance1 = await MintableToken.createToken(
      'testToken',
      'tTKN',
      wallet1
    );
    await tokenInstance1.mintTokens(senderAddress, '100000000000000000000');
    tokenInstance2 = await MintableToken.createToken(
      'testToken',
      'tTKN',
      wallet2
    );
    await tokenInstance2.mintTokens(senderAddress, "100000");

    console.log('finished token deployments');
  });

  it('should query token balance on both chains', async function () {
    const balance1 = await tokenInstance1.getBalance(senderAddress);
    console.log(`tokenBalance on chain 1: ${balance1}`);
    const balance2 = await tokenInstance2.getBalance(senderAddress);
    console.log(`tokenBalance on chain 2: ${balance2}`);
  });

  after(function () {
    ganacheServer1.close(console.error);
    ganacheServer2.close(console.error);
  });
});
