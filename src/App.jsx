import { useAccount } from 'wagmi'
import { WalletConnect } from './components/WalletConnect'
import { GameInterface } from './components/GameInterface'
import './MudStyle.css'

function App() {
  const { isConnected, chain } = useAccount()

  return (
    <div className="app">
      <header className="app-header">
        <h1>🦄 Monad 修仙世界🦄</h1>
      </header>

      <main className="app-main">
        {!isConnected ? (
          <WalletConnect />
        ) : (
          <GameInterface />
        )}
      </main>
    </div>
  )
}

export default App
