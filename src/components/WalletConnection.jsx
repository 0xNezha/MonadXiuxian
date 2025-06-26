import { useConnect, useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

const WalletConnection = () => {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { isConnected } = useAccount()
  const [hasMetaMask, setHasMetaMask] = useState(false)

  // 检查 MetaMask 是否安装
  useEffect(() => {
    const hasEthereum = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
    setHasMetaMask(hasEthereum)
  }, [])

  if (isConnected) return null

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-sm w-full mx-4">
        <div className="border border-gray-600 p-6 bg-gray-900 rounded-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2 text-yellow-400">🦄Monad 修仙世界🦄</h1>
            <p className="text-gray-400 text-sm">连接钱包开始修炼</p>
          </div>

          {!hasMetaMask && (
            <div className="mb-4 p-3 border border-yellow-600 bg-yellow-900 bg-opacity-20 rounded text-center">
              <p className="text-yellow-400 text-sm mb-2">需要安装 MetaMask</p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                下载 MetaMask
              </a>
            </div>
          )}

          <div className="space-y-3">
            {connectors.map((connector) => {
              const isReady = connector.ready || (connector.id === 'injected' && hasMetaMask)

              return (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  disabled={!isReady || isLoading}
                  className={`
                    w-full p-4 border rounded transition-colors duration-200
                    ${!isReady
                      ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'border-green-600 bg-green-900 hover:bg-green-800 text-green-200'
                    }
                    ${isLoading && pendingConnector?.id === connector.id ? 'animate-pulse' : ''}
                  `}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-lg">
                      {isLoading && pendingConnector?.id === connector.id
                        ? '连接中...'
                        : `连接 ${connector.name}`
                      }
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {error && (
            <div className="mt-4 p-3 border border-red-600 bg-red-900 bg-opacity-20 rounded">
              <p className="text-red-400 text-sm text-center">
                连接失败: {error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletConnection
