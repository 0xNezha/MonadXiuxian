import { useAccount, useChainId } from 'wagmi'
import { useXiuxianContract } from '../hooks/useXiuxianContract'
import { monadTestnet } from '../config/wagmi'
import DecodeTest from './DecodeTest'

const ContractTest = () => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const {
    playerExists,
    playerData,
    registerPlayer,
    isRegistering,
    refetchPlayerExists,
    refetchPlayerData
  } = useXiuxianContract()

  const isCorrectNetwork = chainId === monadTestnet.id

  const handleTestRegister = async () => {
    try {
      await registerPlayer('测试玩家')
      setTimeout(() => {
        refetchPlayerExists()
        refetchPlayerData()
      }, 3000)
    } catch (error) {
      console.error('注册失败:', error)
    }
  }

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">智能合约测试</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">连接状态</h3>
          <p>钱包连接: {isConnected ? '已连接' : '未连接'}</p>
          <p>钱包地址: {address || '无'}</p>
          <p>当前网络: {chainId}</p>
          <p>正确网络: {isCorrectNetwork ? '是' : '否'} (需要 {monadTestnet.id})</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">合约状态</h3>
          <p>合约地址: 0x925031548668D8f1338dFbD6E81Ca788a9FeCdE6</p>
          <p>玩家存在: {playerExists === undefined ? '加载中...' : playerExists ? '是' : '否'}</p>
          {playerData && (
            <div className="mt-2">
              <p>昵称: {playerData.nickname}</p>
              <p>等级: {playerData.level}</p>
              <p>修为: {playerData.cultivation}</p>
              <p>功力: {playerData.power}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">操作</h3>
          <button
            onClick={handleTestRegister}
            disabled={!isConnected || !isCorrectNetwork || playerExists || isRegistering}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? '注册中...' : '测试注册'}
          </button>
          
          <button
            onClick={() => {
              refetchPlayerExists()
              refetchPlayerData()
            }}
            className="ml-2 px-4 py-2 bg-green-600 hover:bg-green-700"
          >
            刷新数据
          </button>
        </div>

        <div className="mt-6">
          <DecodeTest />
        </div>
      </div>
    </div>
  )
}

export default ContractTest
