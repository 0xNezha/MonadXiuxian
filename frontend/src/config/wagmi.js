import { createConfig, http } from 'wagmi'
import { hardhat } from 'wagmi/chains'

// Monad测试网配置
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet-explorer.monad.xyz',
    },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [hardhat, monadTestnet],
  transports: {
    [hardhat.id]: http(),
    [monadTestnet.id]: http(),
  },
})
