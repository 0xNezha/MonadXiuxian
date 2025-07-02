import { useState, useEffect } from 'react'

export function AdventureTab({ player, onUpdate }) {
  const [monsters, setMonsters] = useState([])
  const [battleLog, setBattleLog] = useState([])
  const [isBattling, setIsBattling] = useState(false)

  // 怪物名称列表
  const monsterNames = [
    '野狼', '山贼', '毒蛇', '巨熊', '恶鬼', '骷髅兵', '哥布林', '食人魔',
    '石头人', '火焰精灵', '冰霜巨人', '暗影刺客', '邪恶法师', '龙族守卫'
  ]

  // 生成随机怪物
  const generateMonsters = () => {
    const newMonsters = []
    for (let i = 0; i < 8; i++) {
      const name = monsterNames[Math.floor(Math.random() * monsterNames.length)]
      const level = Math.floor(Math.random() * 5) + 1
      const health = 50 + level * 20 + Math.floor(Math.random() * 30)
      
      newMonsters.push({
        id: i,
        name,
        level,
        health,
        maxHealth: health,
        attack: 8 + level * 3,
        defense: 3 + level * 2
      })
    }
    setMonsters(newMonsters)
  }

  useEffect(() => {
    generateMonsters()
  }, [])

  const addToBattleLog = (message) => {
    setBattleLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const attackMonster = async (monsterId) => {
    if (isBattling || !player) return

    setIsBattling(true)
    const monster = monsters.find(m => m.id === monsterId)
    if (!monster) return

    const playerLevel = Number(player.level)
    const playerHealth = Number(player.health)
    const playerAttack = 10 + (playerLevel - 1) * 5
    const playerDefense = 5 + (playerLevel - 1) * 3

    let currentPlayerHealth = playerHealth
    let currentMonsterHealth = monster.health

    addToBattleLog(`开始与 ${monster.name} (等级${monster.level}) 战斗！`)

    // 模拟战斗过程
    const battleInterval = setInterval(() => {
      // 玩家攻击怪物
      const playerDamage = Math.max(1, playerAttack - monster.defense + Math.floor(Math.random() * 10) - 5)
      currentMonsterHealth -= playerDamage
      addToBattleLog(`你对 ${monster.name} 造成了 ${playerDamage} 点伤害`)

      if (currentMonsterHealth <= 0) {
        // 玩家胜利
        addToBattleLog(`${monster.name} 被击败！`)
        
        // 随机奖励
        const rewards = []
        const xiuweiReward = Math.floor(Math.random() * 20) + 10
        const goldReward = Math.floor(Math.random() * 30) + 10
        
        rewards.push(`修为 +${xiuweiReward}`)
        rewards.push(`金币 +${goldReward}`)
        
        // 随机物品奖励
        if (Math.random() < 0.3) {
          const itemNames = ['铁剑', '布衣', '护身符', '修炼心得', '回血丹']
          const randomItem = itemNames[Math.floor(Math.random() * itemNames.length)]
          rewards.push(`获得物品: ${randomItem}`)
        }
        
        addToBattleLog(`战斗胜利！获得奖励: ${rewards.join(', ')}`)
        
        // 重新生成怪物
        generateMonsters()
        
        clearInterval(battleInterval)
        setIsBattling(false)
        return
      }

      // 怪物攻击玩家
      const monsterDamage = Math.max(1, monster.attack - playerDefense + Math.floor(Math.random() * 8) - 4)
      currentPlayerHealth -= monsterDamage
      addToBattleLog(`${monster.name} 对你造成了 ${monsterDamage} 点伤害`)

      // 更新怪物血量显示
      setMonsters(prev => prev.map(m => 
        m.id === monsterId ? { ...m, health: currentMonsterHealth } : m
      ))

      if (currentPlayerHealth <= 0) {
        // 玩家失败
        addToBattleLog(`你被 ${monster.name} 击败了！`)
        addToBattleLog('战斗失败，请提升实力后再来挑战！')
        
        clearInterval(battleInterval)
        setIsBattling(false)
        return
      }
    }, 1500)
  }

  if (!player) {
    return <div>加载中...</div>
  }

  return (
    <div className="adventure-tab">
      <div className="adventure-section">
        <div className="monsters-list">
          <h4>野外怪物</h4>
          <div className="monsters-grid">
            {monsters.map(monster => (
              <div key={monster.id} className="monster-card">
                <div className="monster-info">
                  <div className="monster-name">{monster.name} (Lv.{monster.level})</div>
                  <div className="monster-health">
                    血量: {monster.health}/{monster.maxHealth}
                  </div>
                  <div className="monster-stats">
                    攻击: {monster.attack} | 防御: {monster.defense}
                  </div>
                </div>
                <button
                  onClick={() => attackMonster(monster.id)}
                  disabled={isBattling || monster.health <= 0}
                  className="attack-btn"
                >
                  {monster.health <= 0 ? '已击败' : '攻击'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="battle-log">
          <h4>战斗日志</h4>
          <div className="log-content">
            {battleLog.length === 0 ? (
              <div className="no-log">暂无战斗记录</div>
            ) : (
              battleLog.slice(-10).map((log, index) => (
                <div key={index} className="log-entry">{log}</div>
              ))
            )}
          </div>
          {battleLog.length > 0 && (
            <button 
              onClick={() => setBattleLog([])}
              className="clear-log-btn"
            >
              清空日志
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
