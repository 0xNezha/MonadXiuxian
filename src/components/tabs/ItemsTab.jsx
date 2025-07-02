import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import contractAddresses from '../../contracts/addresses.json'
import XiuxianGameABI from '../../contracts/XiuxianGame.json'

export function ItemsTab({ player, onUpdate }) {
  const { address } = useAccount()
  const [items, setItems] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // 读取玩家物品
  const { data: itemsData, refetch: refetchItems } = useReadContract({
    address: contractAddresses.XiuxianGame,
    abi: XiuxianGameABI.abi,
    functionName: 'getPlayerItems',
    args: [address],
    enabled: !!address,
  })

  useEffect(() => {
    if (itemsData) {
      setItems(itemsData)
    }
  }, [itemsData])

  // 监听交易确认
  useEffect(() => {
    if (isConfirmed && onUpdate) {
      onUpdate()
      refetchItems()
      setIsProcessing(false)
    }
  }, [isConfirmed, onUpdate, refetchItems])

  const equipItem = async (itemIndex) => {
    setIsProcessing(true)
    try {
      writeContract({
        address: contractAddresses.XiuxianGame,
        abi: XiuxianGameABI.abi,
        functionName: 'equipItem',
        args: [itemIndex],
      })
    } catch (error) {
      console.error('装备失败:', error)
      setIsProcessing(false)
    }
  }

  const unequipItem = async (itemIndex) => {
    setIsProcessing(true)
    try {
      writeContract({
        address: contractAddresses.XiuxianGame,
        abi: XiuxianGameABI.abi,
        functionName: 'unequipItem',
        args: [itemIndex],
      })
    } catch (error) {
      console.error('卸下失败:', error)
      setIsProcessing(false)
    }
  }

  if (!player) {
    return <div>加载中...</div>
  }

  const equippedItems = items.filter(item => item.isEquipped)
  const backpackItems = items.filter(item => !item.isEquipped)

  const getItemTypeName = (type) => {
    const types = {
      1: '武器',
      2: '衣服', 
      3: '饰品',
      4: '书籍',
      5: '材料'
    }
    return types[Number(type)] || '未知'
  }

  return (
    <div className="items-tab">
      <h3>物品</h3>
      
      <div className="items-section">
        <div className="gold-display">
          <h4>金币: {Number(player.gold)}</h4>
        </div>

        <div className="equipped-items">
          <h4>已装备物品</h4>
          {equippedItems.length === 0 ? (
            <div className="no-items">暂无装备</div>
          ) : (
            <div className="items-grid">
              {equippedItems.map((item, index) => (
                <div key={index} className="item-card equipped">
                  <div className="item-name">{item.name}</div>
                  <div className="item-type">{getItemTypeName(item.itemType)}</div>
                  {Number(item.attackBonus) > 0 && (
                    <div className="item-bonus">攻击力 +{Number(item.attackBonus)}</div>
                  )}
                  {Number(item.defenseBonus) > 0 && (
                    <div className="item-bonus">防御力 +{Number(item.defenseBonus)}</div>
                  )}
                  <div className="item-actions">
                    <button
                      onClick={() => unequipItem(index)}
                      disabled={isProcessing || isConfirming}
                      className="unequip-btn"
                    >
                      卸下
                    </button>
                    <button className="sell-btn">出售 ({Number(item.value)} 金币)</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="backpack-items">
          <h4>背包物品</h4>
          {backpackItems.length === 0 ? (
            <div className="no-items">背包为空</div>
          ) : (
            <div className="items-grid">
              {backpackItems.map((item, index) => (
                <div key={index} className="item-card">
                  <div className="item-name">{item.name}</div>
                  <div className="item-type">{getItemTypeName(item.itemType)}</div>
                  {Number(item.attackBonus) > 0 && (
                    <div className="item-bonus">攻击力 +{Number(item.attackBonus)}</div>
                  )}
                  {Number(item.defenseBonus) > 0 && (
                    <div className="item-bonus">防御力 +{Number(item.defenseBonus)}</div>
                  )}
                  <div className="item-actions">
                    {Number(item.itemType) <= 3 ? (
                      <button
                        onClick={() => equipItem(index + equippedItems.length)}
                        disabled={isProcessing || isConfirming}
                        className="equip-btn"
                      >
                        装备
                      </button>
                    ) : (
                      <button className="use-btn">使用</button>
                    )}
                    <button className="sell-btn">出售 ({Number(item.value)} 金币)</button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
