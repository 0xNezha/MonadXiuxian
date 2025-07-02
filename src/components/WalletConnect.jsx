import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { monadTestnet } from '../config/wagmi'

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  const handleSwitchToMonad = () => {
    switchChain({ chainId: monadTestnet.id })
  }

  if (isConnected) {
    const isCorrectNetwork = chain?.id === monadTestnet.id || chain?.id === 31337 // 支持本地网络

    return (
      <div className="wallet-info">
        <div className="wallet-address">
          <strong>钱包地址:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <div className="network-info">
          <strong>网络:</strong> {chain?.name}
        </div>
        {!isCorrectNetwork && (
          <div className="network-warning">
            <p style={{ color: 'red' }}>请切换到 Monad 测试网</p>
            <button onClick={handleSwitchToMonad} className="switch-network-btn">
              切换到 Monad 测试网
            </button>
          </div>
        )}
        <button onClick={() => disconnect()} className="disconnect-btn">
          断开连接
        </button>
      </div>
    )
  }

  return (
    <div className="wallet-connect">
      <h2>✨连接钱包开始修仙之旅✨</h2>
      <button onClick={handleConnect} className="connect-btn">
        连接钱包
      </button>
    </div>
  )
}
