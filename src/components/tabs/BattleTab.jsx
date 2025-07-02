import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import contractAddresses from '../../contracts/addresses.json'
import XiuxianGameABI from '../../contracts/XiuxianGame.json'

export function BattleTab({ player, onUpdate }) {
  const { address } = useAccount()
  const [leaderboard, setLeaderboard] = useState([])
  const [isChallenging, setIsChallenging] = useState(false)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // 读取排行榜
  const { data: leaderboardData, refetch: refetchLeaderboard } = useReadContract({
    address: contractAddresses.XiuxianGame,
    abi: XiuxianGameABI.abi,
    functionName: 'getLeaderboard',
    enabled: true,
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
        address: contractAddresses.XiuxianGame,
        abi: XiuxianGameABI.abi,
        functionName: 'challengePlayer',
        args: [opponentAddress],
      })
    } catch (error) {
      console.error('挑战失败:', error)
      setIsChallenging(false)
    }
  }

  // 监听交易确认
  useEffect(() => {
    if (isConfirmed && onUpdate) {
      onUpdate()
      refetchLeaderboard()
      setIsChallenging(false)
    }
  }, [isConfirmed, onUpdate, refetchLeaderboard])

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
                        disabled={isChallenging || isConfirming}
                        className="challenge-btn"
                      >
                        {isChallenging || isConfirming ? '挑战中...' : '挑战'}
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
