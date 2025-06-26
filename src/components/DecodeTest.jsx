import { decodeAbiParameters } from 'viem'

const DecodeTest = () => {
  // 测试解码功能
  const testDecode = () => {
    const hexData = '0x000000000000000000000000000000019200000000000000000000000000000001000000000000000000000000000000082000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000104922304600000000000000000000000000000006771111109710012100000000000000000000000000'
    
    console.log('测试十六进制数据:', hexData)
    
    try {
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
      const decoded = decodeAbiParameters(returnTypes, hexData)
      console.log('解码结果:', decoded)
      
      return {
        nickname: decoded[0],
        level: Number(decoded[1]),
        cultivation: Number(decoded[2]),
        power: Number(decoded[3]),
        experience: Number(decoded[4]),
        lastLoginTime: Number(decoded[5])
      }
    } catch (error) {
      console.error('解码失败:', error)
      return null
    }
  }

  const result = testDecode()

  return (
    <div className="p-4 bg-gray-800 border border-gray-600 rounded">
      <h3 className="text-lg font-bold text-yellow-400 mb-3">解码测试</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-400">测试数据: </span>
          <span className="text-xs text-gray-300 font-mono break-all">
            000000000000000000000000000000019200000000000000000000000000000001000000000000000000000000000000082000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000104922304600000000000000000000000000000000006771111109710012100000000000000000000000000
          </span>
        </div>
        
        {result ? (
          <div className="mt-3">
            <h4 className="text-md font-semibold text-blue-400 mb-2">解码结果:</h4>
            <div className="space-y-1">
              <div>
                <span className="text-gray-400">昵称: </span>
                <span className="text-cyan-400 font-medium">"{result.nickname}"</span>
              </div>
              <div>
                <span className="text-gray-400">等级: </span>
                <span className="text-yellow-400">{result.level}</span>
              </div>
              <div>
                <span className="text-gray-400">修为: </span>
                <span className="text-purple-400">{result.cultivation}</span>
              </div>
              <div>
                <span className="text-gray-400">功力: </span>
                <span className="text-blue-400">{result.power}</span>
              </div>
              <div>
                <span className="text-gray-400">经验: </span>
                <span className="text-green-400">{result.experience}</span>
              </div>
              <div>
                <span className="text-gray-400">最后登录: </span>
                <span className="text-gray-300">
                  {new Date(result.lastLoginTime * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-red-400">解码失败</div>
        )}
      </div>
    </div>
  )
}

export default DecodeTest
