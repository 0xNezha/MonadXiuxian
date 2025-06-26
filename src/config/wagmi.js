import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// 定义 Monad Testnet 链
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz/'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz/'],
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
  chains: [monadTestnet, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz/'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
})
