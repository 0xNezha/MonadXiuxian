import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import contractAddresses from '../contracts/addresses.json'
import XiuxianGameABI from '../contracts/XiuxianGame.json'

export function PlayerRegistration({ onSuccess }) {
  const [daoHao, setDaoHao] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const { writeContract, data: hash } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleRegister = async () => {
    if (!daoHao.trim()) {
      alert('请输入道号')
      return
    }

    setIsRegistering(true)
    try {
      writeContract({
        address: contractAddresses.XiuxianGame,
        abi: XiuxianGameABI.abi,
        functionName: 'registerPlayer',
        args: [daoHao],
      })
    } catch (error) {
      console.error('注册失败:', error)
      setIsRegistering(false)
    }
  }

  // 监听交易确认
  if (isConfirmed && onSuccess) {
    onSuccess()
  }

  return (
    <div className="registration-container">
      <div className="registration-form">
        <h2>⭐欢迎来到修仙世界⭐</h2>
        <p>⚜️请为你的修仙角色起一个响亮的道号⚜️</p>

        <div className="bg-gray-800 p-3 rounded border border-gray-700">
            <h4 className="text-sm font-medium text-yellow-400 mb-2">【修仙须知】</h4>
              <li>道号一旦确定，将伴随你的整个修仙之路</li>
              <li>你的修炼进度将永久保存在区块链上</li>
              <li>可与其他修仙者一同论道切磋</li>
              <li>努力修炼，登上修仙排行榜</li>
          </div>
        
        <div className="input-group">
          <label htmlFor="daoHao">道号:</label>
          <input
            id="daoHao"
            type="text"
            value={daoHao}
            onChange={(e) => setDaoHao(e.target.value)}
            placeholder="请输入您的道号"
            maxLength={20}
            disabled={isRegistering || isConfirming}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={isRegistering || isConfirming || !daoHao.trim()}
          className="register-btn"
        >
          {isRegistering || isConfirming ? '注册中...' : '开始修仙'}
        </button>

        {isConfirming && (
          <div className="status-message">
            交易确认中，请稍候...
          </div>
        )}
      </div>
    </div>
  )
}
