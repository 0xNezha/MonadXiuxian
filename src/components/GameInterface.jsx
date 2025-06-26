import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import PlayerStats from './PlayerStats'
import GameTabs from './GameTabs'
import NicknameModal from './NicknameModal'
import ChatWindow from './ChatWindow'
import { useXiuxianContract } from '../hooks/useXiuxianContract'
import { XIUXIAN_GAME_ADDRESS } from '../contracts/XiuxianGameABI'

const GameInterface = ({ gameData, setGameData }) => {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const [activeTab, setActiveTab] = useState('cultivation')
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showChatWindow, setShowChatWindow] = useState(true)

  // 智能合约相关
  const {
    playerExists,
    playerData,
    registerPlayer,
    updatePlayer,
    login,
    isRegistering,
    isUpdating,
    refetchPlayerExists,
    refetchPlayerData
  } = useXiuxianContract()

  // 检查是否有未保存的变化
  const hasUnsavedChanges = playerData && gameData?.player && playerExists === true && (
    playerData.level !== gameData.player.level ||
    playerData.cultivation !== gameData.player.cultivation ||
    playerData.power !== gameData.player.power ||
    playerData.experience !== gameData.player.experience
  )

  // 检查玩家是否存在
  useEffect(() => {
    if (!address) {
      setIsInitialized(false)
      return
    }



    // 当 playerExists 数据加载完成后处理
    if (playerExists === false && !isInitialized) {
      // 新玩家，显示昵称输入弹窗
      setShowNicknameModal(true)
      setIsInitialized(true)
    } else if (playerExists === true && !isInitialized) {
      // 老玩家，标记为已初始化，等待数据加载
      setIsInitialized(true)
    }
  }, [address, playerExists, isInitialized])

  // 加载老玩家数据
  useEffect(() => {
    if (!address || playerExists !== true) return



    if (playerData && isInitialized) {

      setGameData(prev => {
        // 只有当数据真的不同时才更新
        if (prev?.player?.nickname !== playerData.nickname ||
            prev?.player?.level !== playerData.level ||
            prev?.player?.cultivation !== playerData.cultivation ||
            prev?.player?.power !== playerData.power ||
            prev?.player?.experience !== playerData.experience) {


          return {
            ...prev,
            player: {
              ...prev.player,
              nickname: playerData.nickname,
              level: playerData.level,
              cultivation: playerData.cultivation,
              power: playerData.power,
              experience: playerData.experience
            }
          }
        }
        return prev
      })

      // 记录登录（只执行一次）
      if (!gameData?.player?.nickname) {
        login()
      }
    }
  }, [playerData, playerExists, isInitialized, address])

  // 监听 playerData 变化，确保数据同步
  useEffect(() => {
    if (playerData && gameData?.player && playerData.nickname !== gameData.player.nickname) {

      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          nickname: playerData.nickname
        }
      }))
    }
  }, [playerData?.nickname, gameData?.player?.nickname])

  // 自动增加修为
  useEffect(() => {
    if (!isInitialized) return

    const interval = setInterval(() => {
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          cultivation: prev.player.cultivation + 1
        }
      }))
    }, 1000) // 每秒增加1点修为

    return () => clearInterval(interval)
  }, [setGameData, isInitialized])

  // 移除自动同步，改为手动保存

  // 处理昵称注册
  const handleNicknameSubmit = async (nickname) => {
    try {

      await registerPlayer(nickname)

      // 注册成功后初始化游戏数据
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          nickname: nickname,
          level: 1,
          cultivation: 0,
          power: 10,
          experience: 0
        }
      }))

      setShowNicknameModal(false)

      // 等待一段时间后刷新数据
      setTimeout(() => {
        refetchPlayerExists()
        refetchPlayerData()
      }, 3000)

    } catch (error) {
      console.error('注册玩家失败:', error)
      alert('注册失败，请检查网络连接和钱包余额后重试')
    }
  }

  const handleBreakthrough = () => {
    if (gameData.player.cultivation >= 100) {
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          cultivation: prev.player.cultivation - 100,
          level: prev.player.level + 1,
          health: prev.player.health + 20,
          power: prev.player.power + 5,
          experience: prev.player.experience + 50
        }
      }))
    }
  }

  const handleHeal = () => {
    if (gameData.player.cultivation >= 20) {
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          cultivation: prev.player.cultivation - 20,
          health: Math.min(prev.player.health + 20, 100 + (prev.player.level - 1) * 20)
        }
      }))
    }
  }

  return (
    <>
      {/* 未保存变化提示横幅 */}
      {hasUnsavedChanges && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-900 border-b border-yellow-600 p-3 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-yellow-200 text-sm">
                您有未保存的修炼进度，请及时保存到区块链
              </span>
            </div>
            <span className="text-xs text-yellow-400">
              在"基本属性"区域点击"保存进度"
            </span>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-black text-white flex ${hasUnsavedChanges ? 'pt-16' : ''}`}>
        {/* 左侧玩家属性区域 - 30% */}
        <div className="w-[30%] border-r border-gray-600 p-4">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-green-400">玩家信息</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  refetchPlayerExists()
                  refetchPlayerData()
                }}
                className="text-xs text-blue-400 hover:text-blue-300 border border-blue-600 px-2 py-1"
              >
                刷新数据
              </button>
              <button
                onClick={() => disconnect()}
                className="text-sm text-red-400 hover:text-red-300 border border-red-600 px-2 py-1"
              >
                断开连接
              </button>
            </div>
          </div>

          {/* 显示区块链状态 */}
          <div className="mb-4 p-3 bg-gray-900 border border-gray-600 rounded">
            <h4 className="text-sm font-medium text-blue-400 mb-2">区块链状态</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>网络:</span>
                <span className="text-cyan-400">Monad Testnet</span>
              </div>
              <div className="flex justify-between">
                <span>合约:</span>
                <span className="text-xs font-mono text-gray-400">
                  {XIUXIAN_GAME_ADDRESS.slice(0, 6)}...{XIUXIAN_GAME_ADDRESS.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>状态:</span>
                <span className={playerExists ? 'text-green-400' : 'text-yellow-400'}>
                  {playerExists ? '已注册' : '新玩家'}
                </span>
              </div>
              {playerData && (
                <>
                  <div className="flex justify-between">
                    <span>链上等级:</span>
                    <span className="text-yellow-400">{playerData.level}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    上次登录: {new Date(playerData.lastLoginTime * 1000).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </div>

          <PlayerStats
            player={gameData.player}
          />
        </div>

      {/* 右侧操作界面区域 - 70% */}
      <div className="w-[70%] p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-center text-yellow-400 mb-4">
            🦄Monad 修仙世界🦄 - 挂机修炼
          </h1>
          
          {/* 选项卡导航 */}
          <div className="flex border-b border-gray-600">
            {[
              { id: 'cultivation', name: '修炼' },
              { id: 'items', name: '物品' },
              { id: 'adventure', name: '冒险' },
              { id: 'battle', name: '征战' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <GameTabs 
          activeTab={activeTab}
          gameData={gameData}
          setGameData={setGameData}
        />
      </div>
    </div>

    {/* 聊天按钮 - 当聊天窗口关闭时显示 */}
    {!showChatWindow && (
      <button
        onClick={() => setShowChatWindow(true)}
        className="fixed top-4 right-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-40 flex items-center justify-center transition-colors"
        title="打开聊天室"
      >
        💬
      </button>
    )}

    {/* 昵称输入弹窗 */}
    <NicknameModal
      isOpen={showNicknameModal}
      onClose={() => setShowNicknameModal(false)}
      onSubmit={handleNicknameSubmit}
      isLoading={isRegistering}
    />

    {/* 聊天窗口 - 始终在上层 */}
    <ChatWindow
      isVisible={showChatWindow}
      onClose={() => setShowChatWindow(false)}
    />
  </>
  )
}

export default GameInterface
