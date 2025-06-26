const CultivationTab = ({ gameData, setGameData }) => {
  const { player } = gameData

  const handleBreakthrough = () => {
    if (player.cultivation >= 100) {
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
    if (player.cultivation >= 20) {
      const maxHealth = 100 + (player.level - 1) * 20
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          cultivation: prev.player.cultivation - 20,
          health: Math.min(prev.player.health + 20, maxHealth)
        }
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">修炼界面</h2>
        <p className="text-gray-400">在这里你可以提升修为，突破境界</p>
      </div>

      {/* 修为显示 */}
      <div className="border border-gray-600 p-6 bg-gray-900">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">当前修为</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-300 mb-2">
            {player.cultivation}
          </div>
          <div className="text-gray-400 mb-4">
            修为每秒自动增加 1 点
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
            <div 
              className="bg-cyan-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((player.cultivation % 100), 100)}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-400">
            距离下次突破: {100 - (player.cultivation % 100)} 修为
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-600 p-4 bg-gray-900">
          <h4 className="text-lg font-bold text-yellow-400 mb-3">突破境界</h4>
          <p className="text-gray-400 text-sm mb-4">
            消耗 100 点修为，提升等级、血量和功力
          </p>
          <button
            onClick={handleBreakthrough}
            disabled={player.cultivation < 100}
            className={`w-full py-3 px-4 border transition-colors ${
              player.cultivation >= 100
                ? 'border-yellow-600 bg-yellow-900 hover:bg-yellow-800 text-yellow-200'
                : 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {player.cultivation >= 100 ? '突破境界' : `需要 ${100 - player.cultivation} 修为`}
          </button>
        </div>

        <div className="border border-gray-600 p-4 bg-gray-900">
          <h4 className="text-lg font-bold text-green-400 mb-3">运功疗伤</h4>
          <p className="text-gray-400 text-sm mb-4">
            消耗 20 点修为，恢复 20 点血量
          </p>
          <button
            onClick={handleHeal}
            disabled={player.cultivation < 20}
            className={`w-full py-3 px-4 border transition-colors ${
              player.cultivation >= 20
                ? 'border-green-600 bg-green-900 hover:bg-green-800 text-green-200'
                : 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {player.cultivation >= 20 ? '运功疗伤' : `需要 ${20 - player.cultivation} 修为`}
          </button>
        </div>
      </div>

      {/* 修炼心得 */}
      <div className="border border-gray-600 p-4 bg-gray-900">
        <h4 className="text-lg font-bold text-purple-400 mb-3">修炼心得</h4>
        <div className="text-gray-300 text-sm space-y-2">
          <p>• 修为会自动增长，无需手动操作</p>
          <p>• 每次突破都会大幅提升实力</p>
          <p>• 运功疗伤可以在战斗后快速恢复</p>
          <p>• 等级越高，血量上限越高</p>
        </div>
      </div>
    </div>
  )
}

export default CultivationTab
