import { useState, useEffect, useRef, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useDisconnect } from 'wagmi'
import contractAddresses from '../contracts/addresses.json'
import XiuxianGameABI from '../contracts/XiuxianGame.json'

export function GameInterface() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const [player, setPlayer] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [daoHao, setDaoHao] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [currentXiuwei, setCurrentXiuwei] = useState(0)
  const [playerItems, setPlayerItems] = useState([])

  // 全局战斗日志状态
  const [battleLogs, setBattleLogs] = useState([
    {
      text: "欢迎来到修仙世界！",
      timestamp: new Date().toLocaleTimeString(),
      type: "system"
    }
  ])

  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isError } = useWaitForTransactionReceipt({
    hash,
  })

  // 获取合约地址和ABI
  const contractAddress = contractAddresses.XiuxianGame
  const contractABI = XiuxianGameABI.abi

  // 添加战斗日志的函数
  const addBattleLog = (text, type = "info") => {
    const newLog = {
      text,
      timestamp: new Date().toLocaleTimeString(),
      type
    }
    setBattleLogs(prev => {
      const updated = [...prev, newLog]
      // 保持最多100条日志
      if (updated.length > 100) {
        return updated.slice(-100)
      }
      return updated
    })
  }

  if (!contractAddress || !contractABI) {
    return (
      <div className="error-message">
        <h2>合约未部署</h2>
        <p>请先部署智能合约</p>
        <p>运行: cd contracts && npx hardhat run scripts/deploy.js --network localhost</p>
      </div>
    )
  }

  // 读取玩家信息
  const { data: playerData, refetch: refetchPlayer } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getPlayer',
    args: [address],
    enabled: !!address && !!contractAddress,
  })

  const { data: itemsData, refetch: refetchItems } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getPlayerItems',
    args: [address],
    enabled: !!address && isRegistered,
  })

  useEffect(() => {
    if (playerData) {
      const previousXiuwei = currentXiuwei
      setPlayer(playerData)
      setIsRegistered(playerData.isRegistered)
      setLoading(false)

      // 如果是首次加载（修为为0）或者区块链修为更大（说明有保存进度），则更新修为
      // 否则保持前端的实时修为不变
      if (currentXiuwei === 0 || Number(playerData.xiuwei) > currentXiuwei) {
        setCurrentXiuwei(Number(playerData.xiuwei))
      }
    } else if (playerData === undefined) {
      // 如果没有数据返回，说明可能是新用户
      setLoading(false)
      setIsRegistered(false)
    }
  }, [playerData, currentXiuwei])

  useEffect(() => {
    if (itemsData) {
      setPlayerItems(itemsData)
    }
  }, [itemsData])

  // 每秒自动增加修为（全局计时器）
  useEffect(() => {
    if (isRegistered) {
      const interval = setInterval(() => {
        setCurrentXiuwei(prev => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isRegistered])

  // 监听注册交易确认成功
  useEffect(() => {
    if (isConfirmed) {
      refetchPlayer()
      setIsRegistering(false)
    }
  }, [isConfirmed, refetchPlayer])

  // 监听注册交易失败或写入错误
  useEffect(() => {
    if (isError || writeError) {
      console.error('注册失败:', isError ? '交易被拒绝或失败' : writeError)
      setIsRegistering(false)
    }
  }, [isError, writeError])

  const handleRegister = async () => {
    if (!daoHao.trim()) {
      alert('请输入道号')
      return
    }

    setIsRegistering(true)
    try {
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'registerPlayer',
        args: [daoHao],
      })
    } catch (error) {
      console.error('注册失败:', error)
      setIsRegistering(false)
    }
  }

  if (loading) {
    return <div className="loading">加载玩家信息中...</div>
  }

  if (!isRegistered) {
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

  return (
    <div className="game-interface">
      <WalletHeader address={address} disconnect={disconnect} player={player} />
      <div className="game-layout">
        <div className="left-panel">
          <PlayerAttributesPanel
            player={player}
            contractAddress={contractAddress}
            contractABI={contractABI}
            onUpdate={refetchPlayer}
            currentXiuwei={currentXiuwei}
            playerItems={playerItems}
          />
        </div>
        <div className="center-panel">
          <GameTabsPanel
            player={player}
            contractAddress={contractAddress}
            contractABI={contractABI}
            onUpdate={refetchPlayer}
            currentXiuwei={currentXiuwei}
            setCurrentXiuwei={setCurrentXiuwei}
            onItemsUpdate={refetchItems}
            addBattleLog={addBattleLog}
          />
        </div>
        <div className="right-panel">
          <BattleLogsPanel battleLogs={battleLogs} />
        </div>
      </div>
    </div>
  )
}

// 战斗日志面板组件
function BattleLogsPanel({ battleLogs }) {
  const logsEndRef = useRef(null)

  // 自动滚动到最新日志
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [battleLogs])

  return (
    <div className="battle-logs-panel">
      <h3>📜战斗日志</h3>
      <div className="battle-logs-container">
        {battleLogs.map((log, index) => (
          <div key={index} className={`log-entry ${log.type}`}>
            <span className="log-time">[{log.timestamp}]</span>
            <span className="log-text">{log.text}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}

// 钱包头部组件
function WalletHeader({ address, disconnect, player }) {
  const handleDisconnect = () => {
    if (window.confirm('确定要断开钱包连接吗？这将返回到连接页面。')) {
      disconnect()
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="wallet-header">
      <div className="wallet-info">
        <div className="wallet-address">
          <span className="address-label">钱包地址:</span>
          <span className="address-value">{formatAddress(address)}</span>
        </div>
        {player && player.isRegistered && (
          <div className="player-name">
            <span className="name-label">道号:</span>
            <span className="name-value">{player.daoHao}</span>
          </div>
        )}
      </div>
      <div className="wallet-actions">
        <button
          onClick={handleDisconnect}
          className="disconnect-btn"
          title="断开连接并切换钱包"
        >
          断开连接
        </button>
      </div>
    </div>
  )
}

// 玩家属性面板组件
function PlayerAttributesPanel({ player, contractAddress, contractABI, onUpdate, currentXiuwei, playerItems }) {
  const [isSaving, setIsSaving] = useState(false)
  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isError } = useWaitForTransactionReceipt({
    hash,
  })

  // 计算包含装备加成的实时属性
  const calculateRealTimeStats = () => {
    if (!player || !playerItems) {
      return { attack: 0, defense: 0 }
    }

    // 基础属性
    const baseAttack = 10 + (Number(player.level) - 1) * 5
    const baseDefense = 5 + (Number(player.level) - 1) * 3

    // 计算装备加成
    let equipmentAttack = 0
    let equipmentDefense = 0

    playerItems.forEach(item => {
      if (item.isEquipped) {
        equipmentAttack += Number(item.attackBonus)
        equipmentDefense += Number(item.defenseBonus)
      }
    })

    return {
      attack: baseAttack + equipmentAttack,
      defense: baseDefense + equipmentDefense
    }
  }

  const realTimeStats = calculateRealTimeStats()

  const handleSaveProgress = async () => {
    if (!player) return

    setIsSaving(true)
    try {
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'updatePlayer',
        args: [currentXiuwei, player.health, player.gold], // 使用当前修为而不是区块链上的旧值
      })
    } catch (error) {
      console.error('保存失败:', error)
      setIsSaving(false)
    }
  }

  // 监听交易确认成功
  useEffect(() => {
    if (isConfirmed && onUpdate) {
      onUpdate()
      setIsSaving(false)
    }
  }, [isConfirmed, onUpdate])

  // 监听交易失败或写入错误
  useEffect(() => {
    if (isError || writeError) {
      console.error('交易失败:', isError ? '交易被拒绝或失败' : writeError)
      setIsSaving(false)
    }
  }, [isError, writeError])

  if (!player) {
    return <div>加载玩家信息中...</div>
  }

  // 计算属性
  const level = Number(player.level)
  const attack = 10 + (level - 1) * 5
  const defense = 5 + (level - 1) * 3
  const maxHealth = 100 + (level - 1) * 20

  return (
    <div className="player-panel">
      <h2>🧙‍♂️角色信息</h2>

      <div className="player-info">
        <div className="info-row">
          <span className="info-label">道号:</span>
          <span className="info-value">{player.daoHao}</span>
        </div>

        <div className="info-row">
          <span className="info-label">等级:</span>
          <span className="info-value">{level}</span>
        </div>

        <div className="info-row">
          <span className="info-label">修为:</span>
          <span className="info-value">{currentXiuwei}</span>
        </div>

        <div className="info-row">
          <span className="info-label">血量:</span>
          <span className={`info-value ${Number(player.health) === 0 ? 'health-critical' : ''}`}>
            {Number(player.health)}/{maxHealth}
            {Number(player.health) === 0 && <span className="critical-warning"> ⚠️ 危险！</span>}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">攻击力:</span>
          <span className="info-value">{realTimeStats.attack}</span>
        </div>

        <div className="info-row">
          <span className="info-label">防御力:</span>
          <span className="info-value">{realTimeStats.defense}</span>
        </div>

        <div className="info-row">
          <span className="info-label">金币:</span>
          <span className="info-value">{Number(player.gold)}</span>
        </div>

        <div className="info-row">
          <span className="info-label">胜场:</span>
          <span className="info-value">{Number(player.wins)}</span>
        </div>

        <div className="info-row">
          <span className="info-label">负场:</span>
          <span className="info-value">{Number(player.losses)}</span>
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

// 游戏选项卡面板组件
function GameTabsPanel({ player, contractAddress, contractABI, onUpdate, currentXiuwei, setCurrentXiuwei, onItemsUpdate, addBattleLog }) {
  const [activeTab, setActiveTab] = useState('cultivation')

  const tabs = [
    { id: 'cultivation', name: '☯️修炼' },
    { id: 'items', name: '📦物品' },
    { id: 'adventure', name: '🧭冒险' },
    { id: 'battle', name: '⚔️征战' },
    { id: 'chat', name: '💬聊天' },
  ]

  return (
    <div className="game-tabs-panel">
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'cultivation' && (
          <CultivationTabContent
            player={player}
            contractAddress={contractAddress}
            contractABI={contractABI}
            onUpdate={onUpdate}
            currentXiuwei={currentXiuwei}
            setCurrentXiuwei={setCurrentXiuwei}
          />
        )}
        {activeTab === 'items' && (
          <ItemsTabContent
            player={player}
            contractAddress={contractAddress}
            contractABI={contractABI}
            onUpdate={onUpdate}
            onItemsUpdate={onItemsUpdate}
            currentXiuwei={currentXiuwei}
            setCurrentXiuwei={setCurrentXiuwei}
          />
        )}
        {activeTab === 'adventure' && (
          <AdventureTabContent
            player={player}
            contractAddress={contractAddress}
            contractABI={contractABI}
            onUpdate={onUpdate}
            addBattleLog={addBattleLog}
          />
        )}
        {activeTab === 'battle' && (
          <BattleTabContent player={player} contractAddress={contractAddress} contractABI={contractABI} onUpdate={onUpdate} />
        )}
        {activeTab === 'chat' && (
          <ChatTabContent player={player} />
        )}
      </div>
    </div>
  )
}

// 修炼选项卡内容
function CultivationTabContent({ player, contractAddress, contractABI, onUpdate, currentXiuwei, setCurrentXiuwei }) {
  const [isBreaking, setIsBreaking] = useState(false)
  const [isHealing, setIsHealing] = useState(false)

  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isError } = useWaitForTransactionReceipt({
    hash,
  })

  const handleBreakthrough = async () => {
    if (currentXiuwei < 100) {
      alert('修为不足100，无法突破境界')
      return
    }

    setIsBreaking(true)
    try {
      // 使用新的合约函数，同时更新修为和突破境界
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'updateAndBreakthrough',
        args: [currentXiuwei],
      })
      // 立即更新本地修为状态
      setCurrentXiuwei(prev => prev - 100)
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
      // 使用新的合约函数，同时更新修为和运功疗伤
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'updateAndHeal',
        args: [currentXiuwei],
      })
      // 立即更新本地修为状态
      setCurrentXiuwei(prev => prev - 20)
    } catch (error) {
      console.error('疗伤失败:', error)
      setIsHealing(false)
    }
  }

  // 监听交易确认成功
  useEffect(() => {
    if (isConfirmed && onUpdate) {
      onUpdate()
      setIsBreaking(false)
      setIsHealing(false)
    }
  }, [isConfirmed, onUpdate])

  // 监听交易失败或写入错误
  useEffect(() => {
    if (isError || writeError) {
      console.error('交易失败:', isError ? '交易被拒绝或失败' : writeError)

      // 如果交易失败，恢复修为状态
      if (isBreaking) {
        setCurrentXiuwei(prev => prev + 100) // 恢复突破消耗的修为
      }
      if (isHealing) {
        setCurrentXiuwei(prev => prev + 20) // 恢复疗伤消耗的修为
      }

      setIsBreaking(false)
      setIsHealing(false)
    }
  }, [isError, writeError, isBreaking, isHealing, setCurrentXiuwei])

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
            <span>血量:</span>
            <span className={health === 0 ? 'health-critical' : ''}>
              {health}/{maxHealth}
              {health === 0 && <span className="critical-warning"> ⚠️ 危险！</span>}
            </span>
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

// 物品选项卡内容
function ItemsTabContent({ player, contractAddress, contractABI, onUpdate, onItemsUpdate, currentXiuwei, setCurrentXiuwei }) {
  const { address } = useAccount()
  const [items, setItems] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  // 物品名称映射（英文到中文）
  const itemNameMap = {
    "Wooden Sword": "新手木剑",
    "Cloth Robe": "布衣",
    "Jade Pendant": "玉佩",
    "Basic Cultivation Manual": "基础修炼法",
    "Qi Pill": "回气丹",
    "Healing Potion": "疗伤药"
  }

  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isError } = useWaitForTransactionReceipt({
    hash,
  })

  // 读取玩家物品
  const { data: itemsData, refetch: refetchItems } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getPlayerItems',
    args: [address],
    enabled: !!address && !!contractAddress,
  })

  useEffect(() => {
    if (itemsData) {
      setItems(itemsData)
    }
  }, [itemsData])

  // 监听交易确认成功
  useEffect(() => {
    if (isConfirmed && onUpdate) {
      onUpdate()
      refetchItems()
      if (onItemsUpdate) {
        onItemsUpdate() // 刷新主组件中的物品数据
      }
      setIsProcessing(false)
    }
  }, [isConfirmed, onUpdate, refetchItems, onItemsUpdate])

  // 监听交易失败或写入错误
  useEffect(() => {
    if (isError || writeError) {
      console.error('交易失败:', isError ? '交易被拒绝或失败' : writeError)

      // 如果使用物品失败，需要恢复修为状态
      // 这里我们无法确定具体是哪个操作失败，所以重新获取玩家数据
      if (onUpdate) {
        onUpdate()
      }

      setIsProcessing(false)
    }
  }, [isError, writeError, onUpdate])

  const equipItem = async (backpackIndex) => {
    setIsProcessing(true)
    try {
      // 找到该物品在完整物品数组中的真实索引
      const backpackItem = backpackItems[backpackIndex]
      const realIndex = items.findIndex(item =>
        item.name === backpackItem.name &&
        item.itemType === backpackItem.itemType &&
        item.isEquipped === false
      )

      if (realIndex === -1) {
        console.error('找不到要装备的物品')
        setIsProcessing(false)
        return
      }

      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'equipItem',
        args: [realIndex],
      })
    } catch (error) {
      console.error('装备失败:', error)
      setIsProcessing(false)
    }
  }

  const useItem = async (backpackIndex) => {
    setIsProcessing(true)
    try {
      // 找到该物品在完整物品数组中的真实索引
      const backpackItem = backpackItems[backpackIndex]
      const realIndex = items.findIndex(item =>
        item.name === backpackItem.name &&
        item.itemType === backpackItem.itemType &&
        item.isEquipped === false
      )

      if (realIndex === -1) {
        console.error('找不到要使用的物品')
        setIsProcessing(false)
        return
      }

      // 立即更新前端状态
      if (Number(backpackItem.itemType) === 4) {
        // 书籍：增加100修为
        setCurrentXiuwei(prev => prev + 100)
      }
      // 血量的更新会通过onUpdate()来处理

      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'useItem',
        args: [realIndex],
      })
    } catch (error) {
      console.error('使用失败:', error)
      setIsProcessing(false)
    }
  }

  const sellItem = async (backpackIndex) => {
    setIsProcessing(true)
    try {
      // 找到该物品在完整物品数组中的真实索引
      const backpackItem = backpackItems[backpackIndex]
      const realIndex = items.findIndex(item =>
        item.name === backpackItem.name &&
        item.itemType === backpackItem.itemType &&
        item.isEquipped === false
      )

      if (realIndex === -1) {
        console.error('找不到要出售的物品')
        setIsProcessing(false)
        return
      }

      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'sellItem',
        args: [realIndex],
      })
    } catch (error) {
      console.error('出售失败:', error)
      setIsProcessing(false)
    }
  }

  const unequipItem = async (equippedIndex) => {
    setIsProcessing(true)
    try {
      // 找到该装备在完整物品数组中的真实索引
      const equippedItem = equippedItems[equippedIndex]
      const realIndex = items.findIndex(item =>
        item.name === equippedItem.name &&
        item.itemType === equippedItem.itemType &&
        item.isEquipped === true
      )

      if (realIndex === -1) {
        console.error('找不到要卸下的物品')
        setIsProcessing(false)
        return
      }

      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'unequipItem',
        args: [realIndex],
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
                  <div className="item-name">{itemNameMap[item.name] || item.name}</div>
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
                  <div className="item-name">{itemNameMap[item.name] || item.name}</div>
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
                        onClick={() => equipItem(index)}
                        disabled={isProcessing || isConfirming}
                        className="equip-btn"
                      >
                        装备
                      </button>
                    ) : Number(item.itemType) === 4 ? (
                      <button
                        onClick={() => useItem(index)}
                        disabled={isProcessing || isConfirming}
                        className="use-btn"
                      >
                        阅读 (+100修为)
                      </button>
                    ) : Number(item.itemType) === 5 ? (
                      <button
                        onClick={() => useItem(index)}
                        disabled={isProcessing || isConfirming}
                        className="use-btn"
                      >
                        使用 (+50血量)
                      </button>
                    ) : (
                      <span className="item-info">不可使用</span>
                    )}
                    <button
                      onClick={() => sellItem(index)}
                      disabled={isProcessing || isConfirming}
                      className="sell-btn"
                    >
                      出售 ({Number(item.value)} 金币)
                    </button>
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

// 征战选项卡内容
function BattleTabContent({ player, contractAddress, contractABI, onUpdate }) {
  const { address } = useAccount()
  const [leaderboard, setLeaderboard] = useState([])
  const [isChallenging, setIsChallenging] = useState(false)

  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isError } = useWaitForTransactionReceipt({
    hash,
  })

  // 读取排行榜
  const { data: leaderboardData, refetch: refetchLeaderboard } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getLeaderboard',
    enabled: !!contractAddress,
  })

  useEffect(() => {
    if (leaderboardData) {
      const [addresses, players] = leaderboardData
      const combined = addresses.map((addr, index) => ({
        address: addr,
        player: players[index]
      })).filter(item => item.player.isRegistered)

      // 按等级排序
      combined.sort((a, b) => Number(b.player.level) - Number(a.player.level))
      setLeaderboard(combined)
    }
  }, [leaderboardData])

  const challengePlayer = async (opponentAddress) => {
    if (!player || opponentAddress === address) return

    setIsChallenging(true)
    try {
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'challengePlayer',
        args: [opponentAddress],
      })
    } catch (error) {
      console.error('挑战失败:', error)
      setIsChallenging(false)
    }
  }

  // 监听交易确认成功
  useEffect(() => {
    if (isConfirmed && onUpdate) {
      onUpdate()
      refetchLeaderboard()
      setIsChallenging(false)
    }
  }, [isConfirmed, onUpdate, refetchLeaderboard])

  // 监听交易失败或写入错误
  useEffect(() => {
    if (isError || writeError) {
      console.error('交易失败:', isError ? '交易被拒绝或失败' : writeError)
      setIsChallenging(false)
    }
  }, [isError, writeError])

  if (!player) {
    return <div>加载中...</div>
  }

  return (
    <div className="battle-tab">
      <h3>征战</h3>

      <div className="battle-section">
        <div className="player-stats">
          <h4>你的战绩</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span>等级:</span> <span>{Number(player.level)}</span>
            </div>
            <div className="stat-item">
              <span>胜场:</span> <span>{Number(player.wins)}</span>
            </div>
            <div className="stat-item">
              <span>负场:</span> <span>{Number(player.losses)}</span>
            </div>
            <div className="stat-item">
              <span>胜率:</span>
              <span>
                {Number(player.wins) + Number(player.losses) > 0
                  ? `${((Number(player.wins) / (Number(player.wins) + Number(player.losses))) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="leaderboard">
          <h4>排行榜</h4>
          {leaderboard.length === 0 ? (
            <div className="no-players">暂无其他玩家</div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.map((item, index) => (
                <div key={item.address} className="leaderboard-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="player-info">
                    <div className="player-name">{item.player.daoHao}</div>
                    <div className="player-details">
                      等级: {Number(item.player.level)} |
                      胜场: {Number(item.player.wins)} |
                      负场: {Number(item.player.losses)}
                    </div>
                    <div className="player-address">
                      {item.address.slice(0, 6)}...{item.address.slice(-4)}
                    </div>
                  </div>
                  <div className="challenge-action">
                    {item.address === address ? (
                      <span className="self-indicator">你自己</span>
                    ) : (
                      <button
                        onClick={() => challengePlayer(item.address)}
                        disabled={isChallenging || isConfirming || Number(player.health) === 0}
                        className={`challenge-btn ${Number(player.health) === 0 ? 'health-critical-btn' : ''}`}
                        title={Number(player.health) === 0 ? '血量为0，无法挑战！请先疗伤' : ''}
                      >
                        {isChallenging || isConfirming ? '挑战中...' :
                         Number(player.health) === 0 ? '⚠️ 血量不足' : '挑战'}
                      </button>
                    )}
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

        <div className="battle-info">
          <h4>战斗说明</h4>
          <ul>
            <li>挑战其他玩家进行PVP战斗</li>
            <li>战斗结果基于双方的攻击力、防御力和等级</li>
            <li>胜利者胜场+1，失败者负场+1</li>
            <li>排行榜按等级高低排序</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// 冒险选项卡内容
function AdventureTabContent({ player, contractAddress, contractABI, onUpdate, addBattleLog }) {
  const { address } = useAccount()
  const [monsters, setMonsters] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [randomMonsters, setRandomMonsters] = useState([])
  const [hasInitialized, setHasInitialized] = useState(false)

  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isError } = useWaitForTransactionReceipt({
    hash,
  })

  // 获取怪物列表
  const { data: monstersData } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getMonsters',
    account: address,
  })



  // 监听交易确认
  useEffect(() => {
    if (isConfirmed) {
      console.log('战斗完成!')
      setIsProcessing(false)
      if (onUpdate) {
        onUpdate()
      }
      // 添加战斗完成日志
      if (addBattleLog) {
        addBattleLog('战斗完成！正在处理战斗结果...', 'victory')
        // 延迟添加结果日志，给合约时间更新状态
        setTimeout(() => {
          addBattleLog('战斗结果已更新，请查看属性变化', 'system')
        }, 1000)
      }
    }
  }, [isConfirmed, onUpdate]) // 移除addBattleLog依赖

  // 监听交易失败
  useEffect(() => {
    if (isError || writeError) {
      console.error('战斗失败:', isError ? '交易被拒绝或失败' : writeError)
      setIsProcessing(false)
      if (addBattleLog) {
        addBattleLog('战斗交易失败，请重试', 'defeat')
      }
    }
  }, [isError, writeError]) // 移除addBattleLog依赖

  // 更新怪物数据
  useEffect(() => {
    if (monstersData) {
      setMonsters(monstersData)
      generateRandomMonsterList(monstersData)
    }
  }, [monstersData])



  // 初始化时添加欢迎日志（只执行一次）
  useEffect(() => {
    if (addBattleLog && player && !hasInitialized) {
      addBattleLog(`${player.daoHao} 进入游戏`, 'system')
      setHasInitialized(true)
    }
  }, [player, hasInitialized]) // 移除addBattleLog依赖

  // 生成随机怪物列表
  const generateRandomMonsterList = useCallback((monsterData) => {
    if (!monsterData || monsterData.length === 0) return

    const randomList = []
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * monsterData.length)
      const baseMonster = monsterData[randomIndex]
      const healthVariation = Math.floor(Math.random() * 41) + 80 // 80%-120%
      const randomHealth = Math.floor((Number(baseMonster.maxHealth) * healthVariation) / 100)

      randomList.push({
        ...baseMonster,
        id: randomIndex,
        displayHealth: randomHealth,
        maxHealth: randomHealth
      })
    }
    setRandomMonsters(randomList)
  }, [])

  // 初始化怪物
  const initializeMonsters = async () => {
    setIsProcessing(true)
    try {
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'initializeMonsters',
      })
    } catch (error) {
      console.error('初始化失败:', error)
      setIsProcessing(false)
    }
  }

  // 攻击怪物
  const attackMonster = async (monsterId) => {
    setIsProcessing(true)

    // 找到怪物信息
    const monster = randomMonsters.find(m => m.id === monsterId)
    const monsterName = monster ? monster.name : `怪物#${monsterId}`

    // 添加战斗开始日志
    if (addBattleLog) {
      addBattleLog(`开始攻击 ${monsterName}！`, 'info')
    }

    try {
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'attackMonster',
        args: [monsterId],
      })
    } catch (error) {
      console.error('攻击失败:', error)
      setIsProcessing(false)
      if (addBattleLog) {
        addBattleLog(`攻击 ${monsterName} 失败: ${error.message}`, 'defeat')
      }
    }
  }

  // 刷新怪物列表
  const refreshMonsters = () => {
    if (monsters.length > 0) {
      generateRandomMonsterList(monsters)
    }
  }

  const getMonsterNameInChinese = (englishName) => {
    const nameMap = {
      'Slime': '史莱姆',
      'Goblin': '哥布林',
      'Orc': '兽人',
      'Troll': '巨魔',
      'Dragon': '巨龙'
    }
    return nameMap[englishName] || englishName
  }

  const getHealthBarColor = (currentHealth, maxHealth) => {
    const percentage = (currentHealth / maxHealth) * 100
    if (percentage > 60) return '#4CAF50'
    if (percentage > 30) return '#FF9800'
    return '#F44336'
  }

  if (!player || !player.isRegistered) {
    return <div className="adventure-tab">请先注册角色</div>
  }

  return (
    <div className="adventure-tab">
      <div className="adventure-header">
        <h3>怪物战斗</h3>
        <button
          onClick={refreshMonsters}
          disabled={isProcessing || isConfirming || monsters.length === 0}
          className="refresh-btn"
        >
          刷新怪物
        </button>
      </div>

      {monsters.length === 0 ? (
        <div className="adventure-init">
          <p>怪物尚未初始化</p>
          <button
            onClick={initializeMonsters}
            disabled={isProcessing || isConfirming}
            className="init-btn"
          >
            {isProcessing || isConfirming ? '初始化中...' : '初始化怪物'}
          </button>
        </div>
      ) : (
        <div className="battle-container">
          <div className="monsters-section">
            <h4>野外怪物</h4>
            <div className="monster-list">
              {randomMonsters.map((monster, index) => (
                <div key={index} className="monster-item">
                  <div className="monster-info">
                    <div className="monster-name">{getMonsterNameInChinese(monster.name)}</div>
                    <div className="monster-stats">
                      <span className="monster-level">Lv.{Number(monster.level)}</span>
                      <div className="health-bar">
                        <div className="health-text">
                          {monster.displayHealth}/{monster.displayHealth}
                        </div>
                        <div className="health-bar-bg">
                          <div
                            className="health-bar-fill"
                            style={{
                              width: '100%',
                              backgroundColor: getHealthBarColor(monster.displayHealth, monster.displayHealth)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => attackMonster(monster.id)}
                    disabled={isProcessing || isConfirming || Number(player.health) === 0}
                    className={`attack-btn ${Number(player.health) === 0 ? 'health-critical-btn' : ''}`}
                    title={Number(player.health) === 0 ? '血量为0，无法战斗！请先疗伤' : ''}
                  >
                    {isProcessing || isConfirming ? '战斗中...' :
                     Number(player.health) === 0 ? '⚠️ 血量不足' : '攻击'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// MultiSYNQ 聊天模型和视图
let ChatModel, ChatView

// 定义聊天模型
if (typeof window !== 'undefined' && window.Multisynq) {
  ChatModel = class extends window.Multisynq.Model {
    init() {
      this.views = new Map()
      this.participants = 0
      this.history = []
      this.inactivity_timeout_ms = 20 * 60 * 1000 // 20分钟
      this.lastPostTime = null

      // 订阅系统事件
      this.subscribe(this.sessionId, "view-join", this.viewJoin)
      this.subscribe(this.sessionId, "view-exit", this.viewExit)

      // 订阅用户事件
      this.subscribe("input", "newPost", this.newPost)
      this.subscribe("input", "reset", this.resetHistory)
    }

    viewJoin(viewId) {
      const existing = this.views.get(viewId)
      if (!existing) {
        const nickname = this.randomName()
        this.views.set(viewId, nickname)
      }
      this.participants++
      this.publish("viewInfo", "refresh")
    }

    viewExit(viewId) {
      this.participants--
      this.views.delete(viewId)
      this.publish("viewInfo", "refresh")
    }

    newPost(post) {
      const postingView = post.viewId
      const nickname = post.nickname || this.views.get(postingView)
      const chatLine = `<b>${this.escape(nickname)}:</b> ${this.escape(post.text)}`
      this.addToHistory({ viewId: postingView, html: chatLine })
      this.lastPostTime = this.now()
      this.future(this.inactivity_timeout_ms).resetIfInactive()
    }

    addToHistory(item) {
      this.history.push(item)
      if (this.history.length > 100) this.history.shift()
      this.publish("history", "refresh")
    }

    resetIfInactive() {
      if (this.lastPostTime !== this.now() - this.inactivity_timeout_ms) return
      this.resetHistory("due to inactivity")
    }

    resetHistory(reason) {
      this.history = [{ html: `<i>聊天室重置 ${reason}</i>` }]
      this.lastPostTime = null
      this.publish("history", "refresh")
    }

    escape(text) {
      if (typeof document !== 'undefined') {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
      }
      return text.replace(/[&<>"']/g, function(m) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[m]
      })
    }

    randomName() {
      const names = [
        "青莲剑仙", "紫霄道人", "玄天真君", "太乙散人", "无极道长",
        "凌霄仙子", "碧海潮生", "风雷子", "赤松子", "白云道人",
        "九天玄女", "太上老君", "元始天尊", "通天教主", "接引道人"
      ]
      return names[Math.floor(Math.random() * names.length)]
    }

    setNickname(viewId, nickname) {
      this.views.set(viewId, nickname)
      this.publishFromModel("viewInfo", "refresh")
    }
  }

  // 定义聊天视图
  ChatView = class extends window.Multisynq.View {
    constructor(model, player, address) {
      super(model)
      this.model = model
      this.player = player
      this.address = address
      this.messages = []
      this.participants = 0
      this.nickname = ""

      // 订阅模型事件
      this.subscribe("history", "refresh", this.refreshHistory)
      this.subscribe("viewInfo", "refresh", this.refreshViewInfo)

      // 初始化显示
      this.refreshHistory()
      this.refreshViewInfo()

      // 延迟设置昵称，确保视图完全初始化
      setTimeout(() => {
        this.setInitialNickname()

        // 检查是否需要重置聊天
        if (model.participants === 1 &&
            !model.history.find(item => item.viewId === this.viewId)) {
          this.publish("input", "reset", "for new participants")
        }
      }, 100)
    }

    setInitialNickname() {
      if (this.player?.daoHao) {
        this.nickname = `${this.player.daoHao}(${this.address?.slice(0, 6)}...)`
      } else {
        this.nickname = `道友(${this.address?.slice(0, 6)}...)`
      }
      this.model.setNickname(this.viewId, this.nickname)
    }

    send(text) {
      if (!text.trim()) return

      if (text === "/reset") {
        this.publish("input", "reset", "at user request")
      } else {
        this.publish("input", "newPost", {
          viewId: this.viewId,
          text: text,
          nickname: this.nickname
        })
      }
    }

    refreshHistory() {
      this.messages = this.model.history.map(item => ({
        html: item.html,
        timestamp: new Date().toLocaleTimeString()
      }))
      // 触发React组件更新
      if (this.onHistoryUpdate) {
        this.onHistoryUpdate(this.messages)
      }
    }

    refreshViewInfo() {
      this.participants = this.model.participants
      // 触发React组件更新
      if (this.onViewInfoUpdate) {
        this.onViewInfoUpdate(this.participants)
      }
    }
  }

  // 注册模型
  ChatModel.register("ChatModel")
} else {
  // 降级处理：如果 MultiSYNQ 不可用，创建空类
  ChatModel = class {
    init() {}
  }
  ChatView = class {
    constructor() {}
    send() {}
  }
}

// 聊天选项卡内容
function ChatTabContent({ player }) {
  const { address } = useAccount()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState(0)
  const [chatView, setChatView] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('连接中...')
  const messagesEndRef = useRef(null)

  // 调试：监控messages状态变化
  useEffect(() => {
    console.log('Messages状态更新:', messages)
  }, [messages])

  // 初始化 MultiSYNQ 聊天
  useEffect(() => {
    if (!address) return

    const initChat = async () => {
      try {
        // 检查 MultiSYNQ 是否可用
        if (!window.Multisynq) {
          throw new Error('MultiSYNQ not loaded')
        }

        setConnectionStatus('正在连接...')

        // 等待一小段时间确保所有组件都已加载
        await new Promise(resolve => setTimeout(resolve, 200))

        // 创建会话
        const session = await window.Multisynq.Session.join({
          apiKey: "2V7TyJ7qkb1nxZ1O7YKrZu0ZEGNFT6Shd8elbgcfqk",
          appId: "com.monad.xiuxian.chat",
          name: "xiuxian-chat-room",
          password: "xiuxian123",
          model: ChatModel,
          view: ChatView,
          viewOptions: { player, address }
        })

        // 设置聊天视图
        const view = session.view
        if (view) {
          view.onHistoryUpdate = setMessages
          view.onViewInfoUpdate = setParticipants
          setChatView(view)
          setIsConnected(true)
          setConnectionStatus('已连接')
          console.log("MultiSYNQ 聊天已连接")
        } else {
          throw new Error('Failed to create chat view')
        }
      } catch (error) {
        console.error("MultiSYNQ 连接失败:", error)
        // 降级到本地聊天
        setIsConnected(false)
        setConnectionStatus('连接失败，使用本地模式')
        setMessages([
          {
            html: '<i>欢迎来到修仙世界聊天室！</i>',
            timestamp: new Date().toLocaleTimeString()
          },
          {
            html: '<i>聊天服务暂时不可用，当前为本地模式</i>',
            timestamp: new Date().toLocaleTimeString()
          },
          {
            html: '<b>系统:</b> 您可以在这里输入消息进行测试',
            timestamp: new Date().toLocaleTimeString()
          }
        ])
      }
    }

    initChat()

    // 清理函数
    return () => {
      if (chatView) {
        chatView.unsubscribeAll()
      }
    }
  }, [address, player])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    console.log('发送消息:', inputMessage)
    console.log('聊天状态:', { isConnected, chatView: !!chatView, player: !!player })

    if (chatView && isConnected) {
      console.log('使用MultiSYNQ发送消息')
      chatView.send(inputMessage)
    } else {
      // 降级到本地消息
      console.log('使用本地模式发送消息')
      const nickname = player?.daoHao ? `${player.daoHao}(${address?.slice(0, 6)}...)` : `道友(${address?.slice(0, 6)}...)`
      const newMessage = {
        html: `<b>${nickname}:</b> ${inputMessage}`,
        timestamp: new Date().toLocaleTimeString()
      }
      console.log('添加本地消息:', newMessage)
      setMessages(prev => [...prev, newMessage])
    }

    setInputMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="chat-tab">
      <div className="chat-header">
        <h3>修仙聊天室</h3>
        <div className="chat-status">
          <span className="status-indicator">
            状态: <span className={isConnected ? 'connected' : 'disconnected'}>{connectionStatus}</span>
          </span>
          {isConnected && (
            <span className="participants-count">在线: {participants}人</span>
          )}
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <div
                className="message-content"
                dangerouslySetInnerHTML={{ __html: msg.html }}
              />
              <span className="message-time">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (输入 /reset 重置聊天)"
            className="chat-input"
            maxLength={200}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="send-button"
          >
            发送
          </button>
        </div>

        {isConnected && (
          <div className="chat-tips">
            <small>💡 提示: 输入 "/reset" 可以重置聊天记录</small>
          </div>
        )}
      </div>
    </div>
  )
}
