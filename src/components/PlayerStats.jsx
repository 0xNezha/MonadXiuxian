import { useXiuxianContract } from '../hooks/useXiuxianContract'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import { monadTestnet } from '../config/wagmi'
import { XIUXIAN_GAME_ABI, XIUXIAN_GAME_ADDRESS } from '../contracts/XiuxianGameABI'
import { decodeAbiParameters } from 'viem'
import { useState } from 'react'

const PlayerStats = ({ player }) => {
  const maxHealth = 100 + (player.level - 1) * 20
  const { address } = useAccount()
  const chainId = useChainId()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const {
    playerData,
    updatePlayer,
    isUpdating,
    refetchPlayerData
  } = useXiuxianContract()

  // 直接调用合约的 getMyPlayer 方法
  const { data: contractPlayerData, refetch: refetchContractData } = useReadContract({
    address: XIUXIAN_GAME_ADDRESS,
    abi: XIUXIAN_GAME_ABI,
    functionName: 'getMyPlayer',
    query: {
      enabled: !!address,
    }
  })

  const isCorrectNetwork = chainId === monadTestnet.id

  // 解析合约返回的数据
  const parseContractData = (data) => {
    console.log('原始合约数据:', data)

    if (!data) return null

    try {
      // 如果数据已经是解码后的数组格式
      if (Array.isArray(data) && data.length >= 6) {
        const [nickname, level, cultivation, power, experience, lastLoginTime] = data
        return {
          nickname: nickname || '',
          level: Number(level) || 0,
          cultivation: Number(cultivation) || 0,
          power: Number(power) || 0,
          experience: Number(experience) || 0,
          lastLoginTime: Number(lastLoginTime) || 0
        }
      }

      // 如果数据是十六进制字符串，需要手动解码
      if (typeof data === 'string' && data.startsWith('0x')) {
        console.log('检测到十六进制数据，开始解码:', data)

        // 定义 getMyPlayer 的返回类型
        const returnTypes = [
          { type: 'string', name: 'nickname' },
          { type: 'uint256', name: 'level' },
          { type: 'uint256', name: 'cultivation' },
          { type: 'uint256', name: 'power' },
          { type: 'uint256', name: 'experience' },
          { type: 'uint256', name: 'lastLoginTime' }
        ]

        // 使用 viem 解码
        const decoded = decodeAbiParameters(returnTypes, data)
        console.log('解码后的数据:', decoded)

        return {
          nickname: decoded[0] || '',
          level: Number(decoded[1]) || 0,
          cultivation: Number(decoded[2]) || 0,
          power: Number(decoded[3]) || 0,
          experience: Number(decoded[4]) || 0,
          lastLoginTime: Number(decoded[5]) || 0
        }
      }

      // 如果数据是对象格式
      if (typeof data === 'object' && data.nickname !== undefined) {
        return {
          nickname: data.nickname || '',
          level: Number(data.level) || 0,
          cultivation: Number(data.cultivation) || 0,
          power: Number(data.power) || 0,
          experience: Number(data.experience) || 0,
          lastLoginTime: Number(data.lastLoginTime) || 0
        }
      }

      console.warn('未知的数据格式:', typeof data, data)
      return null

    } catch (error) {
      console.error('解析合约数据失败:', error)
      return null
    }
  }

  const parsedContractData = parseContractData(contractPlayerData)



  // 保存数据到合约
  const handleSaveToContract = async () => {
    if (!isCorrectNetwork || !address || !player) return

    try {
      setIsSaving(true)
      await updatePlayer(
        player.level,
        player.cultivation,
        player.power,
        player.experience
      )

      setLastSaved(new Date())

      // 保存成功后立即刷新合约数据
      setTimeout(() => {
        refetchPlayerData()
        refetchContractData()
      }, 2000)

    } catch (error) {
      console.error('保存到合约失败:', error)
      alert('保存失败，请检查网络连接和钱包余额')
    } finally {
      setIsSaving(false)
    }
  }

  // 检查数据是否有变化 - 使用直接的合约数据
  const hasChanges = parsedContractData && (
    parsedContractData.level !== player.level ||
    parsedContractData.cultivation !== player.cultivation ||
    parsedContractData.power !== player.power ||
    parsedContractData.experience !== player.experience
  )

  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <div className="border border-gray-600 p-3 bg-gray-900">
        <h3 className="text-lg font-bold text-green-400 mb-2">基本属性</h3>
        <div className="space-y-2 text-sm">
          {/* 昵称 - 直接从合约读取 */}
          <div className="flex justify-between">
            <span className="text-gray-400">道号:</span>
            <div className="flex flex-col items-end">
              <span className="text-cyan-400 font-medium">
                {parsedContractData?.nickname || player?.nickname || '未设置'}
              </span>
              {parsedContractData?.nickname && (
                <span className="text-xs text-green-400">
                  ✓ 来自区块链
                </span>
              )}
            </div>
          </div>

          {/* 钱包地址 */}
          <div className="flex justify-between">
            <span className="text-gray-400">地址:</span>
            <span className="text-white font-mono text-xs">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '未连接'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">血量:</span>
            <span className="text-red-400">{player.health}/{maxHealth}</span>
          </div>

          {/* 功力 - 显示本地和合约数据 */}
          <div className="flex justify-between">
            <span className="text-gray-400">功力:</span>
            <div className="flex flex-col items-end">
              <span className="text-blue-400">{player.power}</span>
              {parsedContractData && parsedContractData.power !== player.power && (
                <span className="text-xs text-gray-500">
                  (链上: {parsedContractData.power})
                </span>
              )}
            </div>
          </div>

          {/* 等级 - 显示本地和合约数据 */}
          <div className="flex justify-between">
            <span className="text-gray-400">等级:</span>
            <div className="flex flex-col items-end">
              <span className="text-yellow-400">{player.level}</span>
              {parsedContractData && parsedContractData.level !== player.level && (
                <span className="text-xs text-gray-500">
                  (链上: {parsedContractData.level})
                </span>
              )}
            </div>
          </div>

          {/* 修为 - 显示本地和合约数据 */}
          <div className="flex justify-between">
            <span className="text-gray-400">修为:</span>
            <div className="flex flex-col items-end">
              <span className="text-purple-400">{player.cultivation}</span>
              {parsedContractData && parsedContractData.cultivation !== player.cultivation && (
                <span className="text-xs text-gray-500">
                  (链上: {parsedContractData.cultivation})
                </span>
              )}
            </div>
          </div>

          {/* 经验 - 显示本地和合约数据 */}
          <div className="flex justify-between">
            <span className="text-gray-400">经验:</span>
            <div className="flex flex-col items-end">
              <span className="text-green-400">{player.experience}</span>
              {parsedContractData && parsedContractData.experience !== player.experience && (
                <span className="text-xs text-gray-500">
                  (链上: {parsedContractData.experience})
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">职业:</span>
            <span className="text-green-400">{player.profession}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-4 pt-3 border-t border-gray-700 space-y-2">
          <button
            onClick={handleSaveToContract}
            disabled={!isCorrectNetwork || !hasChanges || isSaving || isUpdating}
            className={`w-full py-2 px-3 text-sm font-medium transition-colors ${
              hasChanges && isCorrectNetwork
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving || isUpdating ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                保存中...
              </div>
            ) : hasChanges ? (
              '保存到区块链'
            ) : (
              '数据已同步'
            )}
          </button>

          <button
            onClick={handleSaveToContract}
            disabled={!isCorrectNetwork || !hasChanges || isSaving || isUpdating}
            className={`w-full py-1 px-3 text-xs transition-colors ${
              hasChanges && isCorrectNetwork
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving || isUpdating ? '保存中...' : hasChanges ? '保存进度' : '进度已保存'}
          </button>

          {/* 状态信息 */}
          <div className="mt-2 text-xs text-center">
            {!isCorrectNetwork ? (
              <span className="text-red-400">请切换到 Monad Testnet</span>
            ) : hasChanges ? (
              <span className="text-yellow-400">
                ⚠️ 有未保存的进度变化
              </span>
            ) : lastSaved ? (
              <span className="text-green-400">
                ✅ 上次保存: {lastSaved.toLocaleTimeString()}
              </span>
            ) : parsedContractData ? (
              <span className="text-gray-400">
                链上更新: {new Date(parsedContractData.lastLoginTime * 1000).toLocaleString()}
              </span>
            ) : (
              <span className="text-gray-400">等待链上数据...</span>
            )}
          </div>
        </div>
      </div>



      {/* 装备信息 */}
      <div className="border border-gray-600 p-3 bg-gray-900">
        <h3 className="text-lg font-bold text-orange-400 mb-2">装备</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">武器:</span>
            <span className="text-white">
              {player.equipment.weapon?.name || '无'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">衣服:</span>
            <span className="text-white">
              {player.equipment.armor?.name || '无'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">饰品:</span>
            <span className="text-white">
              {player.equipment.accessory?.name || '无'}
            </span>
          </div>
        </div>
      </div>

      {/* 财富信息 */}
      <div className="border border-gray-600 p-3 bg-gray-900">
        <h3 className="text-lg font-bold text-yellow-400 mb-2">财富</h3>
        <div className="flex justify-between">
          <span className="text-gray-400">灵石:</span>
          <span className="text-yellow-400">{player.spiritStones}</span>
        </div>
      </div>
    </div>
  )
}

export default PlayerStats
