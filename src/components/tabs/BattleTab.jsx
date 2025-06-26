import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

// 全局标志防止重复初始化
let isMultisynqInitializing = false

const BattleTab = ({ gameData, setGameData }) => {
  const { address } = useAccount()
  const [leaderboard, setLeaderboard] = useState([])
  const [battleLog, setBattleLog] = useState([])
  const [isInBattle, setIsInBattle] = useState(false)
  const [multisynqStatus, setMultisynqStatus] = useState('disconnected')
  const [session, setSession] = useState(null)

  // MultiSYNQ 初始化 - 只在地址变化时执行
  useEffect(() => {
    if (!address) return

    let isComponentMounted = true
    let currentSession = null

    const initMultiSynq = async () => {
      // 防止重复初始化
      if (isMultisynqInitializing) {
        console.log('MultiSYNQ 正在初始化中，跳过重复请求')
        return
      }

      isMultisynqInitializing = true

      // 设置连接超时
      const connectionTimeout = setTimeout(() => {
        if (!isComponentMounted) return
        console.log('MultiSYNQ 连接超时，使用模拟数据')
        setMultisynqStatus('error')
        isMultisynqInitializing = false
        setLeaderboard([
          { address: '0x1234567890abcdef1234567890abcdef12345678', level: 15, power: 85 },
          { address: '0x2345678901bcdef12345678901bcdef123456789', level: 12, power: 70 },
          { address: '0x3456789012cdef123456789012cdef1234567890', level: 10, power: 60 },
          { address: address, level: gameData?.player?.level || 1, power: gameData?.player?.power || 10 }
        ])
      }, 8000) // 8秒超时

      try {
        setMultisynqStatus('connecting')
        console.log('开始连接 MultiSYNQ...')

        // 检查是否已经加载了 MultiSYNQ
        if (typeof window.Multisynq === 'undefined') {
          // 动态加载 MultiSYNQ 脚本
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/@multisynq/client@latest/bundled/multisynq-client.min.js'

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        // 检查并清理已存在的模型类
        if (window.XiuxianGameModel) {
          console.log('使用已存在的模型类')
          // 如果已经存在，跳过重新定义
        } else {
          // 定义游戏模型
          window.XiuxianGameModel = class extends window.Multisynq.Model {
            init() {
              this.players = new Map()

              // 订阅系统事件
              this.subscribe(this.sessionId, 'view-join', this.viewJoin)
              this.subscribe(this.sessionId, 'view-exit', this.viewExit)

              // 订阅自定义事件
              this.subscribe('game', 'player-update', this.playerUpdate)
            }

            viewJoin(viewId) {
              console.log('玩家加入:', viewId)
              // 玩家加入时，等待他们发送自己的数据
              this.publish('leaderboard', 'refresh')
            }

            viewExit(viewId) {
              console.log('玩家离开:', viewId)
              // 移除离开的玩家
              this.players.delete(viewId)
              this.publish('leaderboard', 'refresh')
            }

            playerUpdate(data) {
              console.log('玩家数据更新:', data)
              this.players.set(data.viewId, {
                viewId: data.viewId,
                address: data.address,
                level: data.level,
                power: data.power,
                lastUpdate: this.now()
              })
              this.publish('leaderboard', 'refresh')
            }

            getLeaderboard() {
              const players = Array.from(this.players.values())
              return players
                .sort((a, b) => b.level - a.level)
                .slice(0, 10)
            }
          }

          // 定义游戏视图
          window.XiuxianGameView = class extends window.Multisynq.View {
            constructor(model) {
              super(model)
              this.model = model

              // 订阅排行榜刷新事件
              this.subscribe('leaderboard', 'refresh', this.refreshLeaderboard)

              // 初始化时刷新排行榜
              this.refreshLeaderboard()

              // 发送当前玩家数据
              if (window.currentPlayerData) {
                this.publish('game', 'player-update', {
                  viewId: this.viewId,
                  address: window.currentPlayerData.address,
                  level: window.currentPlayerData.level,
                  power: window.currentPlayerData.power
                })
              }
            }

            refreshLeaderboard() {
              const leaderboardData = this.model.getLeaderboard()
              if (window.updateXiuxianLeaderboard) {
                window.updateXiuxianLeaderboard(leaderboardData)
              }
            }

            updatePlayerData(address, level, power) {
              this.publish('game', 'player-update', {
                viewId: this.viewId,
                address: address,
                level: level,
                power: power
              })
            }
          }

          // 注册模型和视图
          try {
            window.XiuxianGameModel.register('XiuxianGameModel')
            window.XiuxianGameView.register('XiuxianGameView')
            console.log('MultiSYNQ 模型和视图注册成功')
          } catch (error) {
            console.warn('模型注册警告:', error.message)
            // 如果注册失败，可能是已经注册过了，继续执行
          }
        }

        // 设置全局回调和当前玩家数据
        window.updateXiuxianLeaderboard = (data) => {
          setLeaderboard(data)
        }

        window.currentPlayerData = {
          address: address,
          level: gameData?.player?.level || 1,
          power: gameData?.player?.power || 10
        }

        // 加入会话
        const sessionResult = await window.Multisynq.Session.join({
          apiKey: '2V7TyJ7qkb1nxZ1O7YKrZu0ZEGNFT6Shd8elbgcfqk',
          appId: 'com.xiuxian.battle',
          modelClass: window.XiuxianGameModel,
          viewClass: window.XiuxianGameView,
          sessionName: 'xiuxian-leaderboard',
          sessionPassword: 'xiuxian123'
        })

        clearTimeout(connectionTimeout) // 清除超时
        isMultisynqInitializing = false
        if (!isComponentMounted) return

        currentSession = sessionResult
        setSession(sessionResult)
        setMultisynqStatus('connected')
        console.log('MultiSYNQ 连接成功！')

        // 视图会自动发送玩家数据，这里不需要手动发布
        console.log('玩家信息将通过视图自动发布到 MultiSYNQ')

      } catch (error) {
        clearTimeout(connectionTimeout) // 清除超时
        isMultisynqInitializing = false
        if (!isComponentMounted) return

        console.error('MultiSYNQ 连接失败:', error)
        setMultisynqStatus('error')

        // 使用模拟数据作为备用
        setLeaderboard([
          { address: '0x1234567890abcdef1234567890abcdef12345678', level: 15, power: 85 },
          { address: '0x2345678901bcdef12345678901bcdef123456789', level: 12, power: 70 },
          { address: '0x3456789012cdef123456789012cdef1234567890', level: 10, power: 60 },
          { address: address, level: gameData?.player?.level || 1, power: gameData?.player?.power || 10 }
        ])
      }
    }

    initMultiSynq()

    // 清理函数
    return () => {
      isComponentMounted = false

      if (currentSession) {
        try {
          // MultiSYNQ 会自动处理 view-exit 事件，不需要手动发布
          console.log('玩家离开，MultiSYNQ 将自动处理')
        } catch (error) {
          console.warn('清理会话失败:', error)
        }
      }

      // 清理全局回调
      if (window.updateXiuxianLeaderboard) {
        delete window.updateXiuxianLeaderboard
      }
    }
  }, [address]) // 只依赖 address，避免无限循环

  // 更新玩家信息到 MultiSYNQ - 独立的 effect
  useEffect(() => {
    if (session && address && gameData?.player && multisynqStatus === 'connected') {
      try {
        // 更新全局玩家数据
        window.currentPlayerData = {
          address: address,
          level: gameData.player.level,
          power: gameData.player.power
        }

        // 通过视图更新玩家数据
        if (session.view && session.view.updatePlayerData) {
          session.view.updatePlayerData(address, gameData.player.level, gameData.player.power)
          console.log('玩家数据已更新到 MultiSYNQ:', {
            level: gameData.player.level,
            power: gameData.player.power
          })
        }
      } catch (error) {
        console.warn('更新玩家数据失败:', error)
      }
    }
  }, [session, gameData?.player?.level, gameData?.player?.power, multisynqStatus])

  const challengePlayer = async (opponent) => {
    if (isInBattle || opponent.address === address) return

    setIsInBattle(true)
    setBattleLog([`开始与 ${opponent.address.slice(0, 6)}...${opponent.address.slice(-4)} 战斗！`])

    let playerHealth = gameData.player.health
    let opponentHealth = 100 + (opponent.level - 1) * 20
    const playerPower = gameData.player.power
    const opponentPower = opponent.power

    const battle = () => {
      return new Promise((resolve) => {
        const battleInterval = setInterval(() => {
          // 玩家攻击
          const playerDamage = Math.floor(playerPower * (0.8 + Math.random() * 0.4))
          opponentHealth -= playerDamage
          setBattleLog(prev => [...prev, `你对对手造成了 ${playerDamage} 点伤害`])

          if (opponentHealth <= 0) {
            setBattleLog(prev => [...prev, '你获得了胜利！'])
            clearInterval(battleInterval)
            resolve('win')
            return
          }

          // 对手攻击
          setTimeout(() => {
            const opponentDamage = Math.floor(opponentPower * (0.8 + Math.random() * 0.4))
            playerHealth -= opponentDamage
            setBattleLog(prev => [...prev, `对手对你造成了 ${opponentDamage} 点伤害`])

            if (playerHealth <= 0) {
              setBattleLog(prev => [...prev, '你被击败了！'])
              clearInterval(battleInterval)
              resolve('lose')
              return
            }
          }, 1000)
        }, 2000)
      })
    }

    const result = await battle()

    if (result === 'win') {
      // 玩家胜利
      const cultivationGain = Math.floor(opponent.level * 10)
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          health: playerHealth,
          cultivation: prev.player.cultivation + cultivationGain,
          experience: prev.player.experience + cultivationGain
        }
      }))

      setBattleLog(prev => [...prev, `获得 ${cultivationGain} 修为`])
    } else {
      // 玩家失败
      const cultivationLoss = Math.floor(gameData.player.level * 5)
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          health: Math.max(1, playerHealth),
          cultivation: Math.max(0, prev.player.cultivation - cultivationLoss)
        }
      }))

      setBattleLog(prev => [...prev, `失去 ${cultivationLoss} 修为`])
    }

    setIsInBattle(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">征战天下</h2>
        <p className="text-gray-400">挑战其他玩家，争夺排行榜位置</p>
      </div>

      {/* 排行榜 */}
      <div className="border border-gray-600 p-4 bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-400">修仙排行榜</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                multisynqStatus === 'connected' ? 'bg-green-400' :
                multisynqStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                multisynqStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm text-gray-400">
                {multisynqStatus === 'connected' ? 'MultiSYNQ 已连接' :
                 multisynqStatus === 'connecting' ? '连接中...' :
                 multisynqStatus === 'error' ? '使用模拟数据' : '未连接'}
              </span>
            </div>
            {multisynqStatus === 'error' && (
              <button
                onClick={() => window.location.reload()}
                className="text-xs px-2 py-1 border border-blue-600 bg-blue-900 hover:bg-blue-800 text-blue-200 rounded"
              >
                重试连接
              </button>
            )}
          </div>
        </div>
        
        {leaderboard.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            正在加载排行榜...
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((player, index) => (
              <div key={player.address} className="flex items-center justify-between border border-gray-700 p-3 bg-gray-800">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white font-mono">
                      {player.address === address ? '你' : `${player.address.slice(0, 6)}...${player.address.slice(-4)}`}
                    </div>
                    <div className="text-sm text-gray-400">
                      等级: {player.level} | 功力: {player.power}
                    </div>
                  </div>
                </div>
                {player.address !== address && (
                  <button
                    onClick={() => challengePlayer(player)}
                    disabled={isInBattle}
                    className={`px-4 py-2 border transition-colors ${
                      isInBattle
                        ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'border-purple-600 bg-purple-900 hover:bg-purple-800 text-purple-200'
                    }`}
                  >
                    {isInBattle ? '战斗中...' : '挑战'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 战斗日志 */}
      {battleLog.length > 0 && (
        <div className="border border-gray-600 p-4 bg-gray-900">
          <h3 className="text-xl font-bold text-blue-400 mb-4">战斗记录</h3>
          <div className="bg-black p-3 rounded max-h-60 overflow-y-auto">
            {battleLog.map((log, index) => (
              <div key={index} className="text-green-400 text-sm mb-1 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 征战说明 */}
      <div className="border border-gray-600 p-4 bg-gray-900">
        <h4 className="text-lg font-bold text-purple-400 mb-3">征战规则</h4>
        <div className="text-gray-300 text-sm space-y-2">
          {multisynqStatus === 'connected' ? (
            <>
              <p>• 🌐 实时同步：与全球玩家实时对战</p>
              <p>• 🏆 真实排行榜：显示真实玩家等级和功力</p>
              <p>• ⚔️ 挑战系统：挑战其他在线玩家</p>
              <p>• 📊 数据同步：你的进度实时同步到全球</p>
              <p>• 🎮 多人体验：支持多设备同时游戏</p>
            </>
          ) : (
            <>
              <p>• 挑战模拟玩家，排行榜实时更新</p>
              <p>• 胜利可获得修为，失败会损失修为</p>
              <p>• 排行榜按等级排序，展示前10名玩家</p>
              <p>• 功力越高，战斗胜率越大</p>
              <p className="text-yellow-400">• ⚠️ 当前使用模拟数据，连接 MultiSYNQ 后可与真实玩家对战</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BattleTab
