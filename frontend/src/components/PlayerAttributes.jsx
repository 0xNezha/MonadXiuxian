import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import contractAddresses from '../contracts/addresses.json'
import XiuxianGameABI from '../contracts/XiuxianGame.json'

export function PlayerAttributes({ player, onUpdate }) {
  const [isSaving, setIsSaving] = useState(false)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSaveProgress = async () => {
    if (!player) return

    setIsSaving(true)
    try {
      writeContract({
        address: contractAddresses.XiuxianGame,
        abi: XiuxianGameABI.abi,
        functionName: 'updatePlayer',
        args: [player.xiuwei, player.health, player.gold],
      })
    } catch (error) {
      console.error('保存失败:', error)
      setIsSaving(false)
    }
  }

  // 监听交易确认
  if (isConfirmed && onUpdate) {
    onUpdate()
    setIsSaving(false)
  }

  if (!player) {
    return <div>加载玩家信息中...</div>
  }

  // 计算属性
  const level = Number(player.level)
  const attack = 10 + (level - 1) * 5
  const defense = 5 + (level - 1) * 3
  const maxHealth = 100 + (level - 1) * 20

  return (
    <div className="player-attributes">
      <h2>基本属性</h2>
      
      <div className="attribute-section">
        <div className="attribute-item">
          <span className="attribute-label">道号:</span>
          <span className="attribute-value">{player.daoHao}</span>
        </div>
        
        <div className="attribute-item">
          <span className="attribute-label">等级:</span>
          <span className="attribute-value">{level}</span>
        </div>
        
        <div className="attribute-item">
          <span className="attribute-label">修为:</span>
          <span className="attribute-value">{Number(player.xiuwei)}</span>
        </div>
        
        <div className="attribute-item">
          <span className="attribute-label">血量:</span>
          <span className="attribute-value">{Number(player.health)}/{maxHealth}</span>
        </div>
        
        <div className="attribute-item">
          <span className="attribute-label">攻击力:</span>
          <span className="attribute-value">{attack}</span>
        </div>
        
        <div className="attribute-item">
          <span className="attribute-label">防御力:</span>
          <span className="attribute-value">{defense}</span>
        </div>
        
        <div className="attribute-item">
          <span className="attribute-label">金币:</span>
          <span className="attribute-value">{Number(player.gold)}</span>
        </div>
        
        <div className="attribute-item">
          <span className="attribute-label">胜场:</span>
          <span className="attribute-value">{Number(player.wins)}</span>
        </div>
        
        <div className="attribute-item">
          <span className="attribute-label">负场:</span>
          <span className="attribute-value">{Number(player.losses)}</span>
        </div>
      </div>

      <button
        onClick={handleSaveProgress}
        disabled={isSaving || isConfirming}
        className="save-progress-btn"
      >
        {isSaving || isConfirming ? '保存中...' : '保存进度'}
      </button>

      {isConfirming && (
        <div className="status-message">
          交易确认中，请稍候...
        </div>
      )}
    </div>
  )
}
