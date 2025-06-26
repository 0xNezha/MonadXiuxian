import { useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'
import XiuxianGame from './components/XiuxianGame'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-black text-white font-mono">
          <XiuxianGame />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
