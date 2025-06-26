import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { useState } from 'react'
import { decodeAbiParameters } from 'viem'
import { XIUXIAN_GAME_ABI, XIUXIAN_GAME_ADDRESS } from '../contracts/XiuxianGameABI'

export const useXiuxianContract = () => {
  const { address } = useAccount()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // 检查玩家是否存在
  const { data: playerExists, refetch: refetchPlayerExists } = useReadContract({
    address: XIUXIAN_GAME_ADDRESS,
    abi: XIUXIAN_GAME_ABI,
    functionName: 'playerExists',
    args: [address],
    query: {
      enabled: !!address,
    }
  })

  // 获取玩家信息
  const { data: playerDataRaw, refetch: refetchPlayerData } = useReadContract({
    address: XIUXIAN_GAME_ADDRESS,
    abi: XIUXIAN_GAME_ABI,
    functionName: 'getMyPlayer',
    query: {
      enabled: !!address && playerExists === true,
    }
  })



  // 获取排行榜
  const { data: leaderboardData, refetch: refetchLeaderboard } = useReadContract({
    address: XIUXIAN_GAME_ADDRESS,
    abi: XIUXIAN_GAME_ABI,
    functionName: 'getLeaderboard',
    args: [10], // 获取前10名
  })

  // 写入合约的通用 hook
  const { writeContract, data: hash } = useWriteContract()

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // 注册玩家
  const registerPlayer = async (nickname) => {
    try {
      setIsRegistering(true)
      await writeContract({
        address: XIUXIAN_GAME_ADDRESS,
        abi: XIUXIAN_GAME_ABI,
        functionName: 'registerPlayer',
        args: [nickname],
      })

      // 等待交易确认后刷新数据
      setTimeout(() => {
        refetchPlayerExists()
        refetchPlayerData()
      }, 2000)
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    } finally {
      setIsRegistering(false)
    }
  }

  // 更新玩家数据
  const updatePlayer = async (level, cultivation, power, experience) => {
    try {
      setIsUpdating(true)
      await writeContract({
        address: XIUXIAN_GAME_ADDRESS,
        abi: XIUXIAN_GAME_ABI,
        functionName: 'updatePlayer',
        args: [level, cultivation, power, experience],
      })

      // 等待交易确认后刷新数据
      setTimeout(() => {
        refetchPlayerData()
        refetchLeaderboard()
      }, 2000)
    } catch (error) {
      console.error('更新失败:', error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  // 登录
  const login = async () => {
    try {
      setIsLoggingIn(true)
      await writeContract({
        address: XIUXIAN_GAME_ADDRESS,
        abi: XIUXIAN_GAME_ABI,
        functionName: 'login',
      })

      // 等待交易确认后刷新数据
      setTimeout(() => {
        refetchPlayerData()
      }, 2000)
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      setIsLoggingIn(false)
    }
  }

  // 格式化玩家数据
  const formatPlayerData = (data) => {
    console.log('formatPlayerData 输入:', data)

    if (!data) return null

    try {
      // 如果数据已经是解码后的数组格式
      if (Array.isArray(data) && data.length >= 6) {
        const [nickname, level, cultivation, power, experience, lastLoginTime] = data
        return {
          nickname,
          level: Number(level),
          cultivation: Number(cultivation),
          power: Number(power),
          experience: Number(experience),
          lastLoginTime: Number(lastLoginTime)
        }
      }

      // 如果数据是十六进制字符串，需要手动解码
      if (typeof data === 'string' && data.startsWith('0x')) {
        console.log('Hook 检测到十六进制数据，开始解码:', data)

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
        console.log('Hook 解码后的数据:', decoded)

        return {
          nickname: decoded[0],
          level: Number(decoded[1]),
          cultivation: Number(decoded[2]),
          power: Number(decoded[3]),
          experience: Number(decoded[4]),
          lastLoginTime: Number(decoded[5])
        }
      }

      // 如果数据是对象格式
      if (typeof data === 'object' && data.nickname !== undefined) {
        return {
          nickname: data.nickname,
          level: Number(data.level),
          cultivation: Number(data.cultivation),
          power: Number(data.power),
          experience: Number(data.experience),
          lastLoginTime: Number(data.lastLoginTime)
        }
      }

      console.warn('Hook 未知的数据格式:', typeof data, data)
      return null

    } catch (error) {
      console.error('Hook 解析合约数据失败:', error)
      return null
    }
  }

  // 格式化排行榜数据
  const formatLeaderboardData = (data) => {
    if (!data) return []
    
    const [addresses, nicknames, levels, powers] = data
    return addresses.map((addr, index) => ({
      address: addr,
      nickname: nicknames[index],
      level: Number(levels[index]),
      power: Number(powers[index])
    }))
  }

  return {
    // 状态
    playerExists,
    playerData: formatPlayerData(playerDataRaw),
    leaderboardData: formatLeaderboardData(leaderboardData),

    // 操作
    registerPlayer,
    updatePlayer,
    login,

    // 加载状态
    isRegistering: isRegistering || isConfirming,
    isUpdating: isUpdating || isConfirming,
    isLoggingIn: isLoggingIn || isConfirming,
    isConfirmed,

    // 刷新函数
    refetchPlayerExists,
    refetchPlayerData,
    refetchLeaderboard,
  }
}
