import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import contractAddresses from '../../contracts/addresses.json'
import XiuxianGameABI from '../../contracts/XiuxianGame.json'

export function CultivationTab({ player, onUpdate }) {
  const [currentXiuwei, setCurrentXiuwei] = useState(0)
  const [isBreaking, setIsBreaking] = useState(false)
  const [isHealing, setIsHealing] = useState(false)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // 初始化修为
  useEffect(() => {
    if (player) {
      setCurrentXiuwei(Number(player.xiuwei))
    }
  }, [player])

  // 每秒自动增加修为
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentXiuwei(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleBreakthrough = async () => {
    if (currentXiuwei < 100) {
      alert('修为不足100，无法突破境界')
      return
    }

    setIsBreaking(true)
    try {
      writeContract({
        address: contractAddresses.XiuxianGame,
        abi: XiuxianGameABI.abi,
        functionName: 'breakthrough',
      })
    } catch (error) {
      console.error('突破失败:', error)
      setIsBreaking(false)
    }
  }

  const handleHeal = async () => {
    if (currentXiuwei < 20) {
      alert('修为不足20，无法运功疗伤')
      return
    }

    setIsHealing(true)
    try {
      writeContract({
        address: contractAddresses.XiuxianGame,
        abi: XiuxianGameABI.abi,
        functionName: 'heal',
      })
    } catch (error) {
      console.error('疗伤失败:', error)
      setIsHealing(false)
    }
  }

  // 监听交易确认
  useEffect(() => {
    if (isConfirmed && onUpdate) {
      onUpdate()
      setIsBreaking(false)
      setIsHealing(false)
    }
  }, [isConfirmed, onUpdate])

  if (!player) {
    return <div>加载中...</div>
  }

  const level = Number(player.level)
  const health = Number(player.health)
  const maxHealth = 100 + (level - 1) * 20

  return (
    <div className="cultivation-tab">
      <h3>修炼</h3>
      
      <div className="cultivation-section">
        <div className="xiuwei-display">
          <h4>当前修为</h4>
          <div className="xiuwei-value">{currentXiuwei}</div>
          <div className="xiuwei-info">每秒自动增加 1 点修为</div>
        </div>

        <div className="cultivation-actions">
          <button
            onClick={handleBreakthrough}
            disabled={currentXiuwei < 100 || isBreaking || isConfirming}
            className="breakthrough-btn"
          >
            {isBreaking || isConfirming ? '突破中...' : '突破境界'}
          </button>
          <div className="action-info">
            消耗 100 修为，等级 +1
          </div>

          <button
            onClick={handleHeal}
            disabled={currentXiuwei < 20 || isHealing || isConfirming}
            className="heal-btn"
          >
            {isHealing || isConfirming ? '疗伤中...' : '运功疗伤'}
          </button>
          <div className="action-info">
            消耗 20 修为，血量 +20
          </div>
        </div>

        <div className="current-status">
          <h4>当前状态</h4>
          <div className="status-item">
            <span>等级:</span> <span>{level}</span>
          </div>
          <div className="status-item">
            <span>血量:</span> <span>{health}/{maxHealth}</span>
          </div>
          <div className="status-item">
            <span>攻击力:</span> <span>{10 + (level - 1) * 5}</span>
          </div>
          <div className="status-item">
            <span>防御力:</span> <span>{5 + (level - 1) * 3}</span>
          </div>
        </div>

        {isConfirming && (
          <div className="status-message">
            交易确认中，请稍候...
          </div>
        )}
      </div>
    </div>
  )
}
