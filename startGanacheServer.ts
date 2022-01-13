import ganache from 'ganache';

export type GanacheAccounts = {
  balance: string;
  secretKey: string;
};

export function startGanacheServer(
  port: number,
  networkId: number,
  populatedAccounts: GanacheAccounts[],
  options: any = {}
) {
  const ganacheServer = ganache.server({
    accounts: populatedAccounts,
    blockTime: 2,
    network_id: networkId,
    chainId: networkId,
    ...options,
  });

  ganacheServer.listen(port);
  console.log(`Ganache Started on http://127.0.0.1:${port} ..`);

  return ganacheServer;
}
