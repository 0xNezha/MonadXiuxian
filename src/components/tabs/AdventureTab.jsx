import { useState, useEffect } from 'react'

const AdventureTab = ({ gameData, setGameData }) => {
  const [monsters, setMonsters] = useState([])
  const [battleLog, setBattleLog] = useState([])
  const [isInBattle, setIsInBattle] = useState(false)

  // 生成随机怪物
  useEffect(() => {
    const generateMonsters = () => {
      const monsterTypes = [
        { name: '野狗', health: 30, power: 5, reward: { cultivation: 10, spiritStones: 5 } },
        { name: '稻草人', health: 50, power: 8, reward: { cultivation: 15, spiritStones: 8 } },
        { name: '野狼', health: 80, power: 12, reward: { cultivation: 25, spiritStones: 12 } },
        { name: '山贼', health: 120, power: 15, reward: { cultivation: 35, spiritStones: 20 } },
        { name: '妖狐', health: 150, power: 20, reward: { cultivation: 50, spiritStones: 30 } }
      ]

      const newMonsters = Array.from({ length: 5 }, (_, index) => {
        const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)]
        return {
          id: index + 1,
          ...type,
          maxHealth: type.health
        }
      })

      setMonsters(newMonsters)
    }

    generateMonsters()
    const interval = setInterval(generateMonsters, 30000) // 每30秒刷新怪物

    return () => clearInterval(interval)
  }, [])

  const startBattle = async (monster) => {
    if (isInBattle) return

    setIsInBattle(true)
    setBattleLog([`开始与 ${monster.name} 战斗！`])

    let playerHealth = gameData.player.health
    let monsterHealth = monster.health
    const playerPower = gameData.player.power
    const monsterPower = monster.power

    const battle = () => {
      return new Promise((resolve) => {
        const battleInterval = setInterval(() => {
          // 玩家攻击
          const playerDamage = Math.floor(playerPower * (0.8 + Math.random() * 0.4))
          monsterHealth -= playerDamage
          setBattleLog(prev => [...prev, `你对 ${monster.name} 造成了 ${playerDamage} 点伤害`])

          if (monsterHealth <= 0) {
            setBattleLog(prev => [...prev, `${monster.name} 被击败了！`])
            clearInterval(battleInterval)
            resolve('win')
            return
          }

          // 怪物攻击
          setTimeout(() => {
            const monsterDamage = Math.floor(monsterPower * (0.8 + Math.random() * 0.4))
            playerHealth -= monsterDamage
            setBattleLog(prev => [...prev, `${monster.name} 对你造成了 ${monsterDamage} 点伤害`])

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
      const rewards = monster.reward
      const itemReward = Math.random() < 0.3 ? generateRandomItem() : null

      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          health: playerHealth,
          cultivation: prev.player.cultivation + rewards.cultivation,
          spiritStones: prev.player.spiritStones + rewards.spiritStones,
          experience: prev.player.experience + rewards.cultivation,
          inventory: itemReward ? [...prev.player.inventory, itemReward] : prev.player.inventory
        }
      }))

      setBattleLog(prev => [
        ...prev,
        `获得 ${rewards.cultivation} 修为`,
        `获得 ${rewards.spiritStones} 灵石`,
        ...(itemReward ? [`获得物品: ${itemReward.name}`] : [])
      ])

      // 移除被击败的怪物
      setMonsters(prev => prev.filter(m => m.id !== monster.id))
    } else {
      // 玩家失败
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          health: Math.max(1, playerHealth)
        }
      }))
    }

    setIsInBattle(false)
  }

  const generateRandomItem = () => {
    const items = [
      { name: '铁剑', type: 'weapon', power: 8, price: 50 },
      { name: '皮甲', type: 'armor', power: 4, price: 30 },
      { name: '护身符', type: 'accessory', power: 3, price: 25 },
      { name: '武学秘籍', type: 'book', power: 3, price: 40 },
      { name: '疗伤药', type: 'material', health: 30, price: 20 }
    ]

    const item = items[Math.floor(Math.random() * items.length)]
    return {
      ...item,
      id: Date.now() + Math.random()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">冒险探索</h2>
        <p className="text-gray-400">挑战怪物，获得修为和奖励</p>
      </div>

      {/* 怪物列表 */}
      <div className="border border-gray-600 p-4 bg-gray-900">
        <h3 className="text-xl font-bold text-red-400 mb-4">野外怪物</h3>
        {monsters.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            正在寻找怪物...
          </div>
        ) : (
          <div className="space-y-3">
            {monsters.map(monster => (
              <div key={monster.id} className="flex items-center justify-between border border-gray-700 p-3 bg-gray-800">
                <div className="flex-1">
                  <div className="font-bold text-red-300">{monster.name}</div>
                  <div className="text-sm text-gray-400">
                    血量: {monster.health}/{monster.maxHealth} | 攻击力: {monster.power}
                  </div>
                  <div className="text-sm text-yellow-400">
                    奖励: {monster.reward.cultivation} 修为, {monster.reward.spiritStones} 灵石
                  </div>
                </div>
                <button
                  onClick={() => startBattle(monster)}
                  disabled={isInBattle}
                  className={`px-4 py-2 border transition-colors ${
                    isInBattle
                      ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'border-red-600 bg-red-900 hover:bg-red-800 text-red-200'
                  }`}
                >
                  {isInBattle ? '战斗中...' : '攻击'}
                </button>
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

      {/* 冒险提示 */}
      <div className="border border-gray-600 p-4 bg-gray-900">
        <h4 className="text-lg font-bold text-purple-400 mb-3">冒险指南</h4>
        <div className="text-gray-300 text-sm space-y-2">
          <p>• 击败怪物可以获得修为、灵石和随机物品</p>
          <p>• 怪物每30秒刷新一次</p>
          <p>• 战斗是自动进行的，实力决定胜负</p>
          <p>• 失败后血量会降低，建议及时疗伤</p>
        </div>
      </div>
    </div>
  )
}

export default AdventureTab
