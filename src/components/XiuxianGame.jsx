import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import WalletConnection from './WalletConnection'
import GameInterface from './GameInterface'
import ContractTest from './ContractTest'

const XiuxianGame = () => {
  const { address, isConnected } = useAccount()
  const [gameData, setGameData] = useState(null)

  // 检查是否是测试模式
  const isTestMode = new URLSearchParams(window.location.search).get('test') === 'contract'

  // 初始化游戏数据
  useEffect(() => {
    if (isConnected && address) {
      // 初始化玩家数据
      const initialData = {
        player: {
          name: address,
          health: 100,
          power: 10,
          level: 1,
          experience: 0,
          profession: '练气期',
          cultivation: 0,
          spiritStones: 100,
          equipment: {
            weapon: null,
            armor: null,
            accessory: null
          },
          inventory: [
            { id: 1, name: '基础剑法', type: 'book', power: 5, price: 20 },
            { id: 2, name: '布衣', type: 'armor', power: 2, price: 15 },
            { id: 3, name: '回血丹', type: 'material', health: 20, price: 10 }
          ]
        }
      }
      setGameData(initialData)
    }
  }, [isConnected, address])

  // 如果是测试模式，显示合约测试页面
  if (isTestMode) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="p-4">
          <a href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← 返回游戏
          </a>
          <ContractTest />
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return <WalletConnection />
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">正在初始化修仙世界...</div>
          <div className="animate-pulse">请稍候</div>
        </div>
      </div>
    )
  }

  return <GameInterface gameData={gameData} setGameData={setGameData} />
}

export default XiuxianGame
