import { useState } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { monadTestnet } from '../config/wagmi'

const NicknameModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isCorrectNetwork = chainId === monadTestnet.id

  const handleSubmit = (e) => {
    e.preventDefault()

    // 检查网络
    if (!isCorrectNetwork) {
      setError('请先切换到 Monad Testnet 网络')
      return
    }

    // 验证昵称
    if (!nickname.trim()) {
      setError('请输入昵称')
      return
    }

    if (nickname.length > 20) {
      setError('昵称不能超过20个字符')
      return
    }

    if (nickname.length < 2) {
      setError('昵称至少需要2个字符')
      return
    }

    // 检查特殊字符
    const validPattern = /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/
    if (!validPattern.test(nickname)) {
      setError('昵称只能包含中文、英文、数字、下划线和横线')
      return
    }

    setError('')
    onSubmit(nickname)
  }

  const handleSwitchNetwork = () => {
    switchChain({ chainId: monadTestnet.id })
  }

  const handleInputChange = (e) => {
    setNickname(e.target.value)
    if (error) setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">🦄踏入 Monad 修仙之路🦄</h2>
          <p className="text-gray-300">请为你的修仙角色起一个响亮的道号</p>

          {/* 网络状态 */}
          <div className={`mt-3 p-2 rounded text-sm ${
            isCorrectNetwork
              ? 'bg-green-900 text-green-300 border border-green-600'
              : 'bg-red-900 text-red-300 border border-red-600'
          }`}>
            {isCorrectNetwork ? (
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                已连接到 Monad Testnet
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                  请切换到 Monad Testnet 网络
                </div>
                <button
                  onClick={handleSwitchNetwork}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                >
                  切换网络
                </button>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              道号 / 昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={handleInputChange}
              placeholder="输入你的修仙道号..."
              maxLength={20}
              disabled={isLoading}
              className={`w-full px-3 py-2 bg-black border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 ${
                error ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${error ? 'text-red-400' : 'text-gray-500'}`}>
                {error || '2-20个字符，支持中英文数字'}
              </span>
              <span className="text-xs text-gray-500">
                {nickname.length}/20
              </span>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded border border-gray-700">
            <h4 className="text-sm font-medium text-yellow-400 mb-2">修仙须知</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• 道号一旦确定，将伴随你的整个修仙之路</li>
              <li>• 你的修炼进度将永久保存在区块链上</li>
              <li>• 可与其他修仙者一同论道切磋</li>
              <li>• 努力修炼，登上修仙排行榜</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !nickname.trim() || !isCorrectNetwork}
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  创建中...
                </div>
              ) : (
                '开始修仙之路'
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            创建角色需要支付少量 Gas 费用 (Monad Testnet)
          </p>
          {!isCorrectNetwork && (
            <p className="text-xs text-red-400 mt-1">
              请确保钱包已连接到 Monad Testnet 网络
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default NicknameModal
